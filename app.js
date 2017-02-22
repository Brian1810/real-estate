//importing modules
var express = require( 'express' );
var request = require( 'request' );
var cheerio = require( 'cheerio' );

//creating a new express server
var app = express();

//setting EJS as the templating engine
app.set( 'view engine', 'ejs' );

//setting the 'assets' directory as our static assets dir (css, js, img, etc...)
app.use( '/assets', express.static( 'assets' ) );

var estimation = {
    Title: "Estimation du bien",
    PrixMoyen: 0,
    Décision: "",
}
var DonnéesLbc = {
    prix: 0,
    Ville: 0,
    type: 0,
    surface: 0,
}
var med = {
    PrixMoyenLbc: 0,
}

app.get( '/', function ( req, res ) {
    if ( req.query.lienLBC ) {
        request( req.query.lienLBC, function ( error, response, body ) {

            if ( !error && response.statusCode == 200 ) {
                const $ = cheerio.load( body )
                const DonnéesLbcArray = $( 'section.properties span.value' )
                DonnéesLbc = {
                    prix: parseInt( $( DonnéesLbcArray.get( 0 ) ).text().replace( /\s/g, '' ), 10 ),
                    Ville: $( DonnéesLbcArray.get( 1 ) ).text().trim().toLowerCase().replace( /\_|\s/g, '-' ),
                    type: $( DonnéesLbcArray.get( 2 ) ).text().trim().toLowerCase(),
                    surface: parseInt( $( DonnéesLbcArray.get( 4 ) ).text().replace( /\s/g, '' ), 10 )
                }
                med.PrixMoyenLbc = DonnéesLbc.prix / DonnéesLbc.surface

            }
            else { console.log( error ) }
        }
        )
    }

    var url = 'https://www.meilleursagents.com/prix-immobilier/' + DonnéesLbc.Ville.toLowerCase

    request( url, function ( error, response, body ) {
        if ( !error && response.statusCode == 200 ) {
            const $ = cheerio.load( body );
            var PrixMoyen = "";
            var a = $( this )
            if ( type == "Appartement" ) {
                if ( a.children()[0].next.data == "Prix m² appartement" ) {
                    PrixMoyen = a.next().next().text();
                    PrixMoyen = PrixMoyen.substring( 14, 19 );
                    PrixMoyen = PrixMoyen.split( " " );
                    estimation.PrixMoyen = PrixMoyen[0] + PrixMoyen[1];
                }
            }
            if ( type == "Maison" ) {
                if ( a.children()[0].next.data == "Prix m² maison" ) {
                    PrixMoyen = a.next().next().text();
                    PrixMoyen = PrixMoyen.substring( 14, 19 );
                    PrixMoyen = PrixMoyen.split( " " );
                    estimation.PrixMoyen = PrixMoyen[0] + PrixMoyen[1];
                }
            }
        }
    })


    if ( estimation.PrixMoyen < med.PrixMoyenLbc ) {
        estimation.Décision = "Le prix est trop cher !";
    }
    else if ( estimation.PrixMoyen == med.PrixMoyenLbc ) {
        estimation.Décision = "Le prix est juste";

    }
    else {
        estimation.Décision = "Le prix est trop bas, surement une arnaque";
    }
    //}*/
    res.render( 'home', {

        PremierMessage: DonnéesLbc.prix,
        DeuxiemeMessage: DonnéesLbc.surface,
        TroisièmeMessage: DonnéesLbc.Ville,
        QuatrièmeMessage: DonnéesLbc.type,
        CinquièmeMessage: med.PrixMoyenLbc,
        SixièmeMessage: estimation.PrixMoyen,
        SeptièmeMessage: estimation.Décision,
    });
});


//makes the server respond to the '/' route and serving the 'home.ejs' template in the 'views' directory




//launch the server on the 3000 port
app.listen( 3000, function () {
    console.log( 'App listening on port 3000!' );
});
