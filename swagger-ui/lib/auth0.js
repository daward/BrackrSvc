var auth0login = function() {
    var options = {
        focusInput: false,
        closable: true,
        connections: window.auth0Connections
    };

    window.auth0widget.showSignin(options, function (err, profile, token) {
        var apiKeyAuth = new SwaggerClient.ApiKeyAuthorization("Authorization", "Bearer " + token, "header");
        window.swaggerUi.api.clientAuthorizations.add("key", apiKeyAuth);
    });
};