# Store Promotions

### Setup Instructions:
```
$ cd client
$ npm install
$ bower install
$ grunt serve

$ cd server
$ npm install
$ source bashrc.sh
$ node bin/www
```

Open `localhost:8072` on Browser. First time register a `store` & `login` on subsequent logins.

### Webhook
```
https://localhost:8070/api/locations/ping
```
```javascript
{
	"location": {
		"latitude":12.930980,
		"longitude":77.623642
	},
	"phone_number": "8867742253",
	"detection_time": "2019-01-31T19:20:30.45+03:00"
}

```




