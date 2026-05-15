pipeline {
    agent any

    stage('Clone Repository') {
    steps {
        git branch: 'main', url: 'https://github.com/thanujasreekb5044sse-hub/smart-event-management-system-final.git'
    }
}

        stage('Build Frontend and Backend') {
            steps {
                echo 'Building frontend and backend...'
            }
        }

        stage('Docker Image Creation') {
            steps {
                bat 'docker build -t smart-event-backend ./backend'
                bat 'docker build -t smart-event-frontend ./frontend'
            }
        }

        stage('Kubernetes Deployment') {
            steps {
                bat 'kubectl apply -f k8s/'
            }
        }
    }
}
