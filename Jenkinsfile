pipeline {
    agent any

    environment {
        KUBECONFIG = '/var/lib/jenkins/.kube/config' 
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    googlechatnotification url: 'https://chat.googleapis.com/v1/spaces/AAAANerUmSs/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=q20TTLnxwhs86LCNEx3CyttOtKud3qrVrgBOdDgGSDY',
                    message: " 🔔 Build #${env.BUILD_NUMBER} for ${env.JOB_NAME} started."
                
                }
                git branch: 'main', credentialsId: 'git', url: 'git@bitbucket.org:aashka7240/jenkins-practice.git'
            }
        }
        
        stage('Docker Build') {
            steps {
                 script {
                    sh 'docker build -t aashkajain/backend:latest ./server'
                    sh 'docker build -t aashkajain/frontend:latest ./client'
                }
            }
        }

        stage('Push Docker Images') {
            steps {

                 script {
            withCredentials([usernamePassword(credentialsId: 'dockerhub-registry-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                sh 'docker login -u $DOCKER_USER -p $DOCKER_PASS'
                sh 'docker push aashkajain/backend:latest'
                sh 'docker push aashkajain/frontend:latest'
            }
        }
                
            }
        }

        
        
        stage('Deploy to Kubernetes') {
            steps {
               script {
                    sh 'kubectl apply -f server/server-deployment.yaml'
                    sh 'kubectl apply -f server/server-service.yaml'
                    sh 'kubectl apply -f client/client-deployment.yaml'
                    sh 'kubectl apply -f client/client-service.yaml'
                    sh 'kubectl rollout restart deploy client-deployment'
                    sh 'kubectl rollout restart deploy server-deployment'
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            googlechatnotification url: 'https://chat.googleapis.com/v1/spaces/AAAANerUmSs/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=q20TTLnxwhs86LCNEx3CyttOtKud3qrVrgBOdDgGSDY',
            message: " ✅ ${env.JOB_NAME} : Build #${env.BUILD_NUMBER} - ${currentBuild.currentResult}: Check output at ${env.BUILD_URL}"
        }
        failure {
            googlechatnotification url: 'https://chat.googleapis.com/v1/spaces/AAAANerUmSs/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=q20TTLnxwhs86LCNEx3CyttOtKud3qrVrgBOdDgGSDY',
            message: " ❌ ${env.JOB_NAME} : Build #${env.BUILD_NUMBER} - ${currentBuild.currentResult}: Check output at ${env.BUILD_URL}"
        }
    }
}