GUI pour Hesperides
===================

Prérequis :
* Installer NPM (https://nodejs.org/) via l'installation de node.js

Récupération des dépendances :
* npm install 


	ATTENTION, chez vsct le protocol "git" est refusé depuis l'extérieur.
	Il faut avoir executé la commande suivante au préalable :
	git config --global url.https://github.com/.insteadOf git:://github.com

Plusieurs options pour lancer la GUI :
--------------------------------------

* Utiliser son serveur http préféré: UP TO YOU !
* Utiliser la commande `grunt server` ; démarre un serveur proxy pour gérer les problématiques Cross-Domain
* Utiliser les helpers server.groovy ou server_unix.groovy qui permette de lance run serveur web minimaliste en vert.x (besoin donc d'installer vert.x)

Exemple avec Lighttpd 1.4
-------------------------
* Telecharger Lighttpd : http://lighttpd.dtech.hu/
* Installez le (ou dezippez le)
* Editer le fichier lighttpd.conf
* Modifier server.document-root = <git_repository_path>/hesperides-gui/app
* Par default, l'ihm cherche le back sur localhost. Modifier server.modules pour activer "mod_proxy" et "mod_rewrite"
* Puis ajouter :

    $HTTP["url"] =~ "(^/rest/)" {
      proxy.server  = ( "" => ("" => ( "host" => "127.0.0.1", "port" => 81 )))
    }

    $SERVER["socket"] == ":81" {
      url.rewrite-once = ( "^/rest/(.*)$" => "/rest/$1" )
      proxy.server  = ( "" => ( "" => ( "host" => "127.0.0.1", "port" => 8080, "fix-redirects" => 1 )))
    }