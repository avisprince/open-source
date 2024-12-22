package namespaceHealth

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/robfig/cron/v3"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/metrics/pkg/client/clientset/versioned"
)

type PodStatus struct {
	Name string `json:"name"`
	Status string `json:"status"`
	Cpu int64 `json:"cpu"`
	Memory int64 `json:"memory"`
	Time string `json:"timestamp"`
}

type NamespaceSnapshot map[string]PodStatus
type NamespaceSnapshotHistory []NamespaceSnapshot

type NamespaceHealthServiceReport struct {
	NamespaceId string `json:"namespaceId"`
	Status string `json:"status"`
	History NamespaceSnapshotHistory `json:"history"`
	LastUpdated string `json:"lastUpdated"`
}

type NamespaceHealthService struct {
	Date string
	Report NamespaceHealthServiceReport
}

func Run() {
	service := newService()
	c := cron.New()

	// Schedules the doSomething function to run every 5 seconds
	_, err := c.AddFunc("@every 5s", service.reportNamespaceHealth)
	if err != nil {
		fmt.Println("Error scheduling a task:", err)
		return
	}

	c.Start()
}

func newService() *NamespaceHealthService {
	defaultNamespaceHealthService := &NamespaceHealthService{
		Date: getDate(),
		Report: defaultNamespaceHealthServiceReport(),
	}

	return defaultNamespaceHealthService
}

func defaultNamespaceHealthServiceReport() NamespaceHealthServiceReport {
	return NamespaceHealthServiceReport{
		NamespaceId: os.Getenv("NAMESPACE"),
		Status: "loading",
		History: make(NamespaceSnapshotHistory, 0),
		LastUpdated: getLastUpdated(),
	}
}

func (service *NamespaceHealthService) reportNamespaceHealth() {
	date := getDate()
	if service.Date != date {
		service.Date = date
		service.Report = defaultNamespaceHealthServiceReport()
	}

	snapshot := getNamespaceSnapshot()
	if (snapshot == nil) {
		return
	}

	service.Report.Status = getNamespaceOverallStatus(snapshot)
	service.Report.History = append(make(NamespaceSnapshotHistory, 0), snapshot)
	service.Report.LastUpdated = getLastUpdated()

	jsonData, err := json.Marshal(service.Report)
	if err != nil {
		fmt.Println(err)
		return
	}

	// Ensure all directories in the path exist
	err = os.MkdirAll(getDirName(), 0755)
	if err != nil {
		fmt.Println(err)
		return
	}

	file, err := os.OpenFile(getFileName(), os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer file.Close()

	_, err = file.WriteString(string(jsonData) + "\n")
	if err != nil {
		fmt.Println(err)
		return
	}
}

func getNamespaceSnapshot() NamespaceSnapshot {
	config, err := rest.InClusterConfig()
	if err != nil {
		fmt.Println(err)
		return nil
	}

	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		fmt.Println("Error getting clientset")
		fmt.Println(err)
		return nil
	}

	metricsClientset, err := versioned.NewForConfig(config)
	if err != nil {
		fmt.Println("Error getting metrics client")
		fmt.Println(err)
		return nil
	}

	namespaceStatusInfo, err := getNamespaceStatuses(clientset)
	if err != nil {
		fmt.Println("Error getting namespace statuses")
		fmt.Println(err)
		return nil
	}

	namespaceUsageInfo, err := getNamespaceMetrics(metricsClientset)
	if err != nil {
		fmt.Println("Error getting namespace metrics")
		fmt.Println(err)
		return namespaceStatusInfo
	}

	for podName, status := range namespaceStatusInfo {
		if usage, exists := namespaceUsageInfo[podName]; exists {
			namespaceStatusInfo[podName] = PodStatus{
				Name: podName,
				Status: status.Status,
				Time: status.Time,
				Cpu: usage.Cpu,
				Memory: usage.Memory,
			}
		}
	}

	return namespaceStatusInfo
}

func getNamespaceStatuses(clientset *kubernetes.Clientset) (NamespaceSnapshot, error) {
	now := time.Now().UTC().Format(time.RFC3339)

	// Query pods in a specific namespace
	namespaceId := os.Getenv("NAMESPACE")
	pods, err := clientset.CoreV1().Pods(namespaceId).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	snapshot := make(NamespaceSnapshot)

	for _, pod := range pods.Items {
		snapshot[pod.Name] = PodStatus{
			Name: pod.Name,
			Status: string(pod.Status.Phase),
			Time: now,
			Cpu: 0,
			Memory: 0,
		}
	}

	return snapshot, nil
}

func getNamespaceOverallStatus(snapshot NamespaceSnapshot) string {
	loadingFound := false

	for _, status := range snapshot {
		switch status.Status {
			case "crashed":
				return "crashed"
			case "loading":
				loadingFound = true
		}
	}

	if loadingFound {
		return "loading"
	}

	return "running"
}

func getNamespaceMetrics(metricsClientset *versioned.Clientset) (NamespaceSnapshot, error) {
	now := time.Now().Format(time.RFC3339)
	namespaceId := os.Getenv("NAMESPACE")

	podMetricsList, err := metricsClientset.MetricsV1beta1().PodMetricses(namespaceId).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	snapshot := make(NamespaceSnapshot)
	
	for _, podMetrics := range podMetricsList.Items {
		for _, container := range podMetrics.Containers {
			snapshot[podMetrics.Name] = PodStatus{
				Name: podMetrics.Name,
				Cpu:container.Usage.Cpu().MilliValue(),
				Memory: container.Usage.Memory().Value() / 1024 / 1024,
				Time: now,
			}
		}
	}

	return snapshot, nil
}

func getDirName() string {
	namespace := os.Getenv("NAMESPACE")
	return "Dokkimi/namespaces/" + namespace + "/usage"
}

func getFileName() string {
	dir := getDirName()
	return dir + "/" + getDate() + ".txt"
}

func getDate() string {
	return time.Now().UTC().Format("2006-01-02")
}

func getLastUpdated() string {
	return time.Now().UTC().Format("2006-01-02T15:04:05Z")
}