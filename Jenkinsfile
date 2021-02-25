/* add our library
 * ref :  git@gitlab.docavenue.com:tools/jenkins-libs.git
*/
def lib = library("jenkins-libs@${env.BRANCH_NAME}").com.cegedim.docavenue

// define job properties
properties([
  gitLabConnection('Docavenue'),
  buildDiscarder(logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '', numToKeepStr: '20'))
])
// define our global vars
def app = "maiia"
def branchName = ""
def imageTag = ""
def latestImageTag = "latest"
def k8Creds = "maiia-sandbox"
def k8Context = "maiia-sandbox"
def k8url = "https://k8s-eb.cegedim.cloud/k8s/clusters/c-x4rdq"
def registryHost = "artefacts-maiia.cegedim.cloud"
def namespace = "maiia-sandbox"
def helm
def helmRepoURL = "https://artefacts.docavenue.com/artifactory"
def repo = "maiia.helm"

//abort running build if new one is started
def buildNumber = env.BUILD_NUMBER as int
if (buildNumber > 1) milestone(buildNumber - 1)
milestone(buildNumber)

node {
  properties([disableConcurrentBuilds()])
  stage('Clone repository') {
    sh 'figlet -c "Clone repository !"'
    deleteDir()
    checkout scm
    branchName = env.BRANCH_NAME.replace('/','-').replace('_','-')
    if (branchName != "master") {
      repo = "${repo}-${branchName}".toString()
    }
    imageTag = "${branchName}-${env.BUILD_NUMBER}"
    if (branchName == "master") {
        app = "maiia"
        k8url = "https://k8s-eb.cegedim.cloud/k8s/clusters/c-6t7c5"
        k8Context = "maiia-prod"
        namespace = "maiia-prod"
        latestImageTag = "prod-latest"
        k8Creds = "maiia-prod"
        registryHost = "artefacts-maiia.cegedim.cloud"
        sh 'sed -i -e "s|http://isp-ceg.emea.cegedim.grp:3128||g" Dockerfile'
    } else if (branchName.startsWith("rc-")) {
        app = "maiia"
        k8url = "https://k8s-eb.cegedim.cloud/k8s/clusters/c-6mrz7"
        k8Context = "maiia-preproduction"
        namespace = "maiia-preproduction"
        latestImageTag = "staging-latest"
        k8Creds = "maiia-preproduction"
        registryHost = "artefacts-maiia.cegedim.cloud"
        sh 'sed -i -e "s|http://isp-ceg.emea.cegedim.grp:3128||g" Dockerfile'
    } else if (branchName == "staging") {
        app = "maiia"
        k8url = "https://k8s-eb.cegedim.cloud/k8s/clusters/c-6mrz7"
        k8Context = "maiia-preproduction"
        namespace = "maiia-preproduction"
        latestImageTag = "staging-latest"
        k8Creds = "maiia-preproduction"
        registryHost = "artefacts-maiia.cegedim.cloud"
        sh 'sed -i -e "s|http://isp-ceg.emea.cegedim.grp:3128||g" Dockerfile'
    } else if (branchName == ("int")) {
        app = "maiia"
        k8url = "https://k8s-eb.cegedim.cloud/k8s/clusters/c-hfb4r"
        k8Context = "maiia-integration"
        namespace = "maiia-integration"
        imageTag = "${branchName}-${env.BUILD_NUMBER}"
        latestImageTag = "int-latest"
        k8Creds = "maiia-integration"
        registryHost = "artefacts-maiia.cegedim.cloud"
        sh 'sed -i -e "s|http://isp-ceg.emea.cegedim.grp:3128||g" Dockerfile'
    } else if (branchName == ("anonymous")) {
        app = "maiia"
        k8url = "https://k8s-eb.cegedim.cloud/k8s/clusters/c-hfb4r"
        k8Context = "maiia-integration"
        namespace = "maiia-anonymous"
        imageTag = "${branchName}-${env.BUILD_NUMBER}"
        latestImageTag = "anonymous-latest"
        k8Creds = "maiia-integration"
        registryHost = "artefacts-maiia.cegedim.cloud"
        sh 'sed -i -e "s|http://isp-ceg.emea.cegedim.grp:3128||g" Dockerfile'
    }
    helm = lib.HelmHelper.new(app,this,repo,namespace, k8Context, k8url, k8Creds, helmRepoURL)
  }

  def imageName = "${registryHost}/${app}/${app}-microservices"

  if (!(branchName.startsWith("rc-") || branchName == "master" || branchName == "int" || branchName == "staging" || branchName == "anonymous")) {
    try {
      gitlabCommitStatus {
        stage('SonarQube analysis') {

          withSonarQubeEnv{
            sh 'figlet -c "Test SonarQube !"'
            sh 'sed -i -e "s/#SONARTOKEN#/${SONAR_AUTH_TOKEN}/g" sonar-project.properties'
            sh 'docker-compose -f docker-compose-sonar.yml up --force-recreate --abort-on-container-exit --build'
            sh 'docker-compose -f docker-compose-sonar.yml stop'
          }
        }
      }
    } catch (e) {
      echo 'SonarQube analysis failed'
    } finally {
      echo 'Generate reports'
    }
  }

  def bcbNode
  stage('Build image') {
    sh 'figlet -c "Build image !"'
    bcbNode = docker.build(imageName)
  }

  stage('Push image') {
    sh 'figlet -c "Push image !"'
    docker.withRegistry("https://${registryHost}", "sa_docavenue_deploy") {
      bcbNode.push(imageTag)
      bcbNode.push(latestImageTag)
    }
  }

  stage('Update K8s deployment') {
    // fetching configurations
    checkout(
      changelog: false,
      poll: false,
      scm: [
        $class: 'GitSCM',
        branches: [[name: "*/${env.BRANCH_NAME}"]],
        doGenerateSubmoduleConfigurations: false,
        extensions: [
          [$class: 'RelativeTargetDirectory', relativeTargetDir: 'pkg'],
          [$class: 'LocalBranch', localBranch: env.BRANCH_NAME]
        ],
        submoduleCfg: [],
        userRemoteConfigs: [[credentialsId: '01f16862-58d9-4f64-80dd-c303fa640377', url: 'git@gitlab.docavenue.com:MAIIA/maiia-pkg.git']]
      ]
    )
    // helm values override
    Map extraArgs = [
      buildNumbers: [
        microservices: env.BUILD_NUMBER
      ],
      branchName: branchName,
      buildNumber: env.BUILD_NUMBER,
      project: 'microservices'
    ]
    // heal upgrade --install
    helm.releaseChart(branchName,extraArgs)
  }
}

