kubectl delete -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
kubectl delete serviceaccount metrics-server -n kube-system
kubectl delete clusterrole system:metrics-server
kubectl delete clusterrolebinding metrics-server:system:auth-delegator
kubectl delete clusterrolebinding system:metrics-server
kubectl delete rolebinding metrics-server-auth-reader -n kube-system
kubectl delete service metrics-server -n kube-system
kubectl delete deployment metrics-server -n kube-system
kubectl delete apiservice v1beta1.metrics.k8s.io
