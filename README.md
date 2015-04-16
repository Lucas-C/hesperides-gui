GUI pour Hesperides

Il faut installer npm sur son poste pour disposer de tous l'environnement de développement
Puis simplement "npm install"

ATTENTION, chez vsct le protocol "git" est refusé depuis l'extérieur.
Il faut avoir executé la commande suivante au préalable :
git config --global url.https://github.com/.insteadOf git:://github.com

Plusieurs options pour lancer la GUI :

- Utiliser son serveur http préféré: UP TO YOU !
- Utiliser les helpers server.groovy ou server_unix.groovy qui permette de lance run serveur web minimaliste en vert.x (besoin donc d'installer vert.x)
- Utiliser le backend hesperides (cf Readme du backend hesperides)
