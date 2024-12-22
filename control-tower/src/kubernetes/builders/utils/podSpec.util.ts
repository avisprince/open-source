import { Injectable } from '@nestjs/common';

@Injectable()
export class PodSpecUtil {
  public volumeMounts() {
    if (process.env.DEV_MODE_APP_DIR) {
      return [
        {
          mountPath: '/app',
          name: 'appdir',
        },
      ];
    }

    return;
  }

  public volumes() {
    if (process.env.DEV_MODE_APP_DIR) {
      return [
        {
          name: 'appdir',
          hostPath: {
            path: process.env.DEV_MODE_APP_DIR,
            type: 'Directory',
          },
        },
      ];
    }

    return;
  }

  public imageName(podName: string) {
    if (process.env.DEV_MODE_APP_DIR) {
      return `${podName}:dev`;
    }

    return `dokkimi/${podName}:latest`;
  }
}
