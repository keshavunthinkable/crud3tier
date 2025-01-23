pipeline {
    agent any

    environment {
        KUBECONFIG = '/var/lib/jenkins/.kube/config' 
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    withCredentials([string(credentialsId: 'google-chat-url', variable: 'GOOGLE_CHAT_URL')]) {
                        googlechatnotification url: "${GOOGLE_CHAT_URL}",
                        message: "🔔 Build #${env.BUILD_NUMBER} for ${env.JOB_NAME} started."
                    }
                
                }
                git branch: 'main', credentialsId: 'git', url: 'git@bitbucket.org:aashka7240/jenkins-practice.git'
            }
        }
        
        stage('Docker Build') {
            steps {
                 script {
                    sh '''#!/bin/bash
                    docker build -t aashkajain/backend:$BUILD_NUMBER ./server
                    docker build -t aashkajain/frontend:$BUILD_NUMBER ./client
                    '''
                }
            }
        }

        stage('Push Docker Images') {
            steps {

                 script {
            withCredentials([usernamePassword(credentialsId: 'dockerhub-registry-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                sh '''#!/bin/bash
                docker login -u $DOCKER_USER -p $DOCKER_PASS
                docker push aashkajain/backend:$BUILD_NUMBER
                docker push aashkajain/frontend:$BUILD_NUMBER
                '''
            }
        }   
                
            }
        }

        
        
        stage('Deploy to Kubernetes') {
            steps {
               script {
                // Replace the BUILD_NUMBER placeholder with the actual build number
                    sh '''#!/bin/bash
                    sed -i "s/BUILD_NUMBER/${BUILD_NUMBER}/g" server/server-deployment.yaml
                    sed -i "s/BUILD_NUMBER/${BUILD_NUMBER}/g" client/client-deployment.yaml

                    cat client/client-deployment.yaml
                    cat server/server-deployment.yaml



                    kubectl apply -f server/server-deployment.yaml
                    kubectl apply -f server/server-service.yaml
                    kubectl apply -f client/client-deployment.yaml
                    kubectl apply -f client/client-service.yaml
                    kubectl rollout restart deploy client-deployment
                    kubectl rollout restart deploy server-deployment
                    '''
                }
            }
        }
    }
    
    post {
        always {
            script {
                def log = currentBuild.rawBuild.getLog(100).join('\n')
                writeFile file: 'console.log', text: log
                
            }
        }
         success {
            script {
                def log = readFile('console.log')
                withCredentials([string(credentialsId: 'google-chat-url', variable: 'GOOGLE_CHAT_URL')]) {
                    def message = "✅ ${env.JOB_NAME} : Build #${env.BUILD_NUMBER} - ${currentBuild.currentResult}: Check output at ${env.BUILD_URL}\n\nLog:\n${log.take(4000)}"
                    echo "Google Chat URL: ${GOOGLE_CHAT_URL}"
                    googlechatnotification url: "${GOOGLE_CHAT_URL}",
                    message: message
                }
                cleanWs()
            }
        }
        failure {
            script {
                def log = readFile('console.log')
                withCredentials([string(credentialsId: 'google-chat-url', variable: 'GOOGLE_CHAT_URL')]) {
                    def message = "❌ ${env.JOB_NAME} : Build #${env.BUILD_NUMBER} - ${currentBuild.currentResult}: Check output at ${env.BUILD_URL}\n\nLog:\n${log.take(4000)}"
                    echo "Google Chat URL: ${GOOGLE_CHAT_URL}"
                    googlechatnotification url: "${GOOGLE_CHAT_URL}",
                    message: message
                }
                cleanWs()
            }
        }
    }
}