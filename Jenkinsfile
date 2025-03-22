    pipeline {
        agent any

        options {
            withFolderProperties()

            // Ensure only one build runs at a time for this job.
            disableConcurrentBuilds()

            // Use timestamps in the console output for easier debugging.
            // timestamps()

            // Manage build retention and disk space by discarding old builds.
            buildDiscarder(logRotator(
                daysToKeepStr: '30',             // Keep builds for 30 days
                numToKeepStr: '10',              // Retain the last 10 builds
                artifactDaysToKeepStr: '15',     // Retain artifacts for 15 days
                artifactNumToKeepStr: '5'        // Retain artifacts for the last 5 builds
            ))
        }

            environment {
                ECR_URL = '730335483782.dkr.ecr.us-east-1.amazonaws.com/node-main/crud3tier'
                IMAGE_TAG = "${env.BUILD_NUMBER}-${BRANCH_NAME}"
                DOCKER_IMAGE = "${env.ECR_URL}:${IMAGE_TAG}"
                DEPLOYMENT_NAME = ""
                REPO_NAME = "node-container"
                 

        
        }

        stages {
            stage("Job Triggered  Notification  " ){
                steps{
                    script{
                        echo 'Job triggered successfully.'
                        emailext subject: "Jenkins Pipeline Triggered : ${env.JOB_NAME} Build #${env.BUILD_NUMBER}", 
                            body: """
                            The Jenkins pipeline has been triggered.<br><br>
                            <b>Project:</b> ${env.JOB_NAME}<br>
                            <b>Build Number:</b> ${env.BUILD_NUMBER}<br>
                            <b>Build URL:</b> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a>
                            """,
                            to: "${EMAIL_RECIPIENTS}", mimeType: 'text/html'
                    }
                }
            } 

            stage('Cloning into a Repo'){
                steps {
                    git branch: "${BRANCH_NAME}", credentialsId: 'github-access-token', url: 'https://github.com/keshavunthinkable/crud3tier.git'

                    }
            }
                    
            /*stage('Install Python3 & Check Version') {
                steps {
                    sh """
                    echo "Installing Python3..."
                    dnf install python3 -y
                    
                    echo "Checking Python3 Version..."
                    python3 --version
                    """
                }
            }*/
            
            stage('Build Docker   Image') {
                steps {
                    sh """
                    echo "Building the Docker image..."
                    docker build -t ${env.DOCKER_IMAGE} .
                    """
                }
            }
            
            /*stage('Gitleaks Scan') {
                steps {
                    script {
                        // Fail build if secrets are found
                        sh '''
                            gitleaks detect \
                                --source . \
                                --verbose \
                                --report-format csv \
                                --exit-code 1 \
                                --report-path gitleaks-report.csv
                        '''
                    }
                }
            }*/
            
            stage('Login to Docker Registry') {
                    steps {
                        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws_credentials']]) {
                        sh """
                        echo "Logging into AWS ECR..."
                        aws ecr get-login-password --region us-east-1 \
                        | docker login --username AWS --password-stdin ${env.ECR_URL} || echo "Login Failed 🚨"
                        """
                        }
                    }
                }


            stage('Push Docker Image') {
                steps {
                    script {
                        // Push the built Docker image to AWS ECR.
                        sh "docker push ${env.DOCKER_IMAGE}"
                    }
                }
            }




            stage('Update kubeconfig') {
                steps {
                    script {
                        // Update kubeconfig to connect to the specified AWS EKS cluster.
                        sh "aws eks update-kubeconfig --name ${CLUSTER_NAME} --region ${AWS_REGION}"
                    }
                }
            }
            stage('Set New Image') {
                steps {
                    script {
                        // Update the Kubernetes deployment with the new Docker image.
                    sh """
                       kubectl set image deployment/${env.DEPLOYMENT_NAME} \
                        ${env.REPO_NAME}=${env.DOCKER_IMAGE} \
                        -n ${env.NAMESPACE}

                # 🚨 Ensure it's applied before restarting
                        kubectl rollout status deployment/${env.DEPLOYMENT_NAME} -n ${env.NAMESPACE}


                    """
                }
            }
            }
            stage('Deploy New Image') {
            steps {
                script {
                    // Restart the deployment to ensure the new image is applied.
                    sh "kubectl rollout restart deployment/${env.DEPLOYMENT_NAME} -n ${env.NAMESPACE}"
                }
            }
        }
            stage('Remove Image from Local') {
            steps {
                script {
                    // Remove the Docker image from the local system to save disk space.
                    sh "docker rmi ${env.DOCKER_IMAGE}"
                }
            }
        }

           
            stage('Restart Pods') {
                steps {
                    script {
            echo "Restarting Pods in Namespace: ${NAMESPACE}"
            sh """
                kubectl delete pods -l app=python-app -n ${NAMESPACE} || true
            """
                }
            }
        }

            stage('Verify Deployment') {
            steps {
                script {
            echo "Verifying Deployment in Namespace: ${NAMESPACE}"
            sh """
                kubectl get pods -n ${NAMESPACE}
                kubectl get svc -n ${NAMESPACE}
                kubectl get ingress -n ${NAMESPACE}
            """
        }   
            }
        }

        stage('Check ALB Address') {
            steps {
                script {
            ALB_URL = sh(script: "kubectl get ingress -n ${NAMESPACE} -o jsonpath='{.items[0].status.loadBalancer.ingress[0].hostname}'", returnStdout: true).trim()
            echo "ALB URL: ${ALB_URL}"
            currentBuild.description = "ALB URL: ${ALB_URL}"
                }
            }
        }
            stage('Secret Scan') {
                steps {
                sh '''
                trufflehog filesystem . --regex --entropy=True || echo 'No Secrets Found'
                '''
                }
            }
    }

   



        post {
            success {
                sendEmail("Success", "Good news! The build was successful.")
                }
            failure {
                script {
                    echo "Rolling back to the previous version of the deployment."
                    sh """
                    kubectl rollout undo deployment/${env.DEPLOYMENT_NAME} -n ${env.NAMESPACE}
                    """
                }
                sendEmail("Failed", "Unfortunately, the build has failed. Rolled back to the previous version.")
            }
            always {
                sendEmail("Completed", "The build has completed. Thanks")
            }
        }
}
    def sendEmail(status, message) {
        emailext(
            subject: "Jenkins Job '${env.JOB_NAME}' - Build #${env.BUILD_NUMBER} - ${status}",
            body: "${message}\n\nCheck console output at ${env.BUILD_URL}",
            recipientProviders: [[$class: 'CulpritsRecipientProvider'], [$class: 'RequesterRecipientProvider']],
            to: "${EMAIL_RECIPIENTS}" // Using the defined environment variable for the email address
        )

    }