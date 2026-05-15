pipeline {
    agent any

    stages {
        stage('Clone Repository') {
            steps {
                git 'https://github.com/YOUR_USERNAME/smart-event-management-system.git'
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
