import org.vertx.groovy.core.streams.Pump

/**
 * Ce script lance un serveur http grâce à Vert.x. Ca permet d'afficher les différentes pages en local via le serveur
 * et d'éviter des problèmes de cross-site domain lorsqu'on ouvre directement le fichier dans le navigateur.
 *
 * Il faut installer Vert.x pour le faire fonctionner. Ensuite lancer ces commandes:
 *
 * $ cd <repertoire où se trouve ce script>
 * $ vertx run server.groovy
 *
 * La page sera disponible sur l'url 'http://localhost:8080'.
 *
 * Le script pointe sur le graphite 'hopper.bck.perf.voyages-sncf.com' (basé au CNIT), ne pas hésiter à changer l'url
 * au besoin.
 */
import org.vertx.groovy.core.buffer.Buffer 

vertx.createHttpServer().requestHandler { req ->
    def file = req.uri == "/" ? "index.html" : req.uri
    def limiterIdx=file.indexOf('?')
    if(limiterIdx>0) file = file.substring(0,limiterIdx)

    println "file to load: $file"

    if (req.uri.startsWith("/rest")) {
        // au lieu d'aller chercher un fichier statique il va chercher dans graphite
        println "starts with /render"
		def body = new Buffer(0)
		def body2 = new Buffer(0)
		req.dataHandler { buffer -> body << buffer }
        req.endHandler {
            req.response.headers << req.headers
            req.response.chunked=true
            def client = vertx.createHttpClient(host: "localhost", port: 8080)
            println "try request on hesperides ${req.uri}"
            def reqFw = client.request(req.method, req.uri) { respFw ->
                req.response.headers.set(respFw.headers)
				req.response.statusCode = respFw.statusCode
				Pump.createPump(respFw, req.response).start()
                respFw.endHandler {
					
					println respFw.statusCode
                    req.response.end()
                }
            }
			reqFw.chunked=true
			reqFw.headers.set(req.headers)
			reqFw << body
            reqFw.end()
        }
    } else {
        req.response.sendFile ".\\app\\$file"

    }
}.listen(8000)

println "listen to http://localhost:8000/index.html"