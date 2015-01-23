# piquote-box


## Requirements

On Debian/Ubuntu, the ALSA backend is selected by default, so be sure to have the alsa.h header file in place:

```
sudo apt-get install libasound2-dev
```

## Usage

```
PORT=3010 node server.js
```

## Try for fun

```
curl -X POST -H "Content-Type: application/json" -d '{ "commits" : [ { "author" : { "name" : "remy" } } ] }' http://172.16.77.160:3010/webhook
```