# Hespérides Pipeline

![alt text](CICD-resource.png)

**Continous Delivery** ==> manual deployment

## Description des pipelines

### Pipelines de build

- `Jenkinsfile_build_docker_image` ([job jenkins](https://usl.jenkins.cloud.socrate.vsct.fr/job/A_USL/job/Hesperides/job/build_docker_image/)):
Pipeline de création de l'image d'[Hesperides](https://github.com/voyages-sncf-technologies/hesperides) pour publication sur le dépôt Docker interne :
récupère l'image Docker du [Dockerhub public](https://hub.docker.com/r/hesperides/hesperides/) pour la surcharger avec le certificat de l'Active Directory, et la pusher vers Artifactory.
_cf._ [vsct-hesperides/Dockerfile](vsct-hesperides/Dockerfile)

Les commits contenant `#RT` dans leur message déclenchent l'exécution de `tests/regression` entre plateformes REL1 (en version `testing` contenant le dernier commit)
et INT1 (en version `latest` ne contenant pas ce dernier commit).

- `Jenkinsfile_build_docker_image_for_gui` ([job jenkins](https://usl.jenkins.cloud.socrate.vsct.fr/job/A_USL/job/Hesperides/job/build_docker_image_for_gui/)):
Pipeline de création de l'image d'[hesperides-gui](https://github.com/voyages-sncf-technologies/hesperides-gui) pour publication sur le dépôt Docker interne :
récupère l'image Docker du [Dockerhub public](https://hub.docker.com/r/hesperides/hesperides-gui/) pour la surcharger avec le certificat de l'Active Directory, et la pusher vers Artifactory.
_cf._ [vsct-hesperides-gui/Dockerfile](vsct-hesperides-gui/Dockerfile)

### Pipelines de déploiement

- `Jenkinsfile_promote` ([job jenkins](https://usl.jenkins.cloud.socrate.vsct.fr/job/A_USL/job/Hesperides/job/promote/)):
tag une image Docker avec une nouvelle version

- `Jenkinsfile_deploy` ([job jenkins](https://usl.jenkins.cloud.socrate.vsct.fr/job/A_USL/job/Hesperides/job/deploy/)):
  * déclenche un Puppet refresh (_cf._ [Environments.md](Environments.md)) via [le job pprundeck HES/Outils/refresh_puppet_agent](https://pprundeck.socrate.vsct.fr/rundeck/project/HES/job/show/03662b77-5169-4828-96e8-8ba855d6c441)
  * redémarre les instances pour tirer la dernière version en exécutant [le job pprundeck HES/Outils/RESTART](https://pprundeck.socrate.vsct.fr/rundeck/project/HES/job/show/c9f92ce5-2d20-4a57-9cb8-8e88aae5412f) qui effectue un `./SHUT && ./BOOT`

- `Jenkinsfile_deploy@PROD` ([job jenkins](https://usl.jenkins.cloud.socrate.vsct.fr/job/A_USL@PROD/job/Hesperides/job/deploy_PROD/)):
identique à `Jenkinsfile_deploy` mais sur `PRD1`, et se déclenchant toutes les nuits

- `Jenkinsfile_batch_hes2els` ([job jenkins](https://usl.jenkins.cloud.socrate.vsct.fr/job/A_USL@PROD/job/Hesperides/job/batch_hes2els/)):
cf. https://wiki.vsct.fr/pages/viewpage.action?pageId=217943778 & https://jira.vsct.fr/browse/USL-1073 pour le contexte

### Autres pipelines

- `Jenkinsfile_perf_tests` : lance les stress tests Gatling sur une plateforme

- `Jenkinsfile_zap` : _work in progress_ - tentative d'intégration du proxy [Zap de l'OWASP](https://www.owasp.org/index.php/OWASP_Zed_Attack_Proxy_Project) avec l'aide de Martin De Roquefeuil

## Tips

Tester une image docker pushée dans le registry privé vsct :
```cmd
docker login --username admgit --password 'XXXXXXXXX' https://hesperides-docker-all.artifact.cloud.socrate.vsct.fr
docker pull hesperides-docker-all.artifact.cloud.socrate.vsct.fr/hesperides/vsct-hesperides:develop
```
