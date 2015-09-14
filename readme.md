# lyst

Public real-time analytics dashboard powered by Google Analytics

## Installation

1. Set up [Google superproxy](https://github.com/googleanalytics/google-analytics-super-proxy) for your site
2. Clone lyst repository
3. Add your lyst application as a new project in [Google's developer console](https://console.developers.google.com)
4. Enable Google Analytics API in the console under `APIs & auth` and `APIs`
5. Set up service account under `APIs & auth` and `Credentials` and save P12 key (remember given secret)
6. Convert P12 key to pem and name it `key.pem` with this command and use given secret: `openssl pkcs12 -in [p12 key filename].p12 -nodes -nocerts > key.pem`
7. Save generated key.pem in lyst root directory
8. Update viewid and query URLs in [requests.json](https://github.com/nbedi/lyst/blob/master/requests.json)
9. Run `node app.js`

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

lyst is released under GNU AGPLv3. See [LICENSE](https://github.com/nbedi/lyst/blob/master/LICENSE) for more details

Placeholder favicon by: Icon made by [Amit Jakhu](http://www.amitjakhu.com) from www.flaticon.com is licensed under CC BY 3.0.
