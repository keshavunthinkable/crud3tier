pipeline {
    agent any

    environment {
        KUBECONFIG = '/var/lib/jenkins/.kube/config' 
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    googlechatnotification url: 'https://chat.googleapis.com/v1/spaces/AAAANerUmSs/messages?key=YOUR_KEY&token=YOUR_TOKEN',
                    message: "Build #${env.BUILD_NUMBER} for ${env.JOB_NAME} started."
                
                }
                git branch: 'main', credentialsId: 'bitbucket_pass', url: 'https://aashkajain7240@bitbucket.org/aashka7240/jenkins-practice.git'
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
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-registry-credentials') {
                        docker.image('aashkajain/backend:latest').push()
                        docker.image('aashkajain/frontend:latest').push()
                    }
                }
            }
        }

        stage('Apply Kubernetes Secrets') {
            steps {
                script {
                    sh 'kubectl apply -f secret.yaml'
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
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            googlechatnotification url: 'https://chat.googleapis.com/v1/spaces/AAAANerUmSs/messages?key=YOUR_KEY&token=YOUR_TOKEN',
            message: "${env.JOB_NAME} : Build #${env.BUILD_NUMBER} - ${currentBuild.currentResult}: Check output at ${env.BUILD_URL}"
        }
        failure {
            googlechatnotification url: 'https://chat.googleapis.com/v1/spaces/AAAANerUmSs/messages?key=YOUR_KEY&token=YOUR_TOKEN',
            message: "${env.JOB_NAME} : Build #${env.BUILD_NUMBER} - ${currentBuild.currentResult}: Check output at ${env.BUILD_URL}"
        }
    }
}