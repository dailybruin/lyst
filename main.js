var googleapis = require('googleapis'),
    JWT = googleapis.auth.JWT,
    analytics = googleapis.analytics('v3');

var SERVICE_ACCOUNT_EMAIL = '321660255245-rlpjc3p8mklls61c126k2mt4mgemc7ds@developer.gserviceaccount.com';
var SERVICE_ACCOUNT_KEY_FILE = __dirname + '/key.pem';


var authClient = new JWT(
    SERVICE_ACCOUNT_EMAIL,
    SERVICE_ACCOUNT_KEY_FILE,
    null,
    ['https://www.googleapis.com/auth/analytics.readonly']
);

authClient.authorize(function(err, tokens) {
    if (err) {
        console.log(err);
        return;
    }

    analytics.data.ga.get({
        auth: authClient,
        'ids': 'ga:95649608',
        'start-date': '2015-01-19',
        'end-date': '2015-01-20',
        'metrics': 'ga:visits'
    }, function(err, result) {
        console.log(err);
        console.log(result);
    });
});
