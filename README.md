## Nginx generator

Generate sites file using nodejs

### Feature

- Create file config
- Copy to /etc/nginx/sites-enabled/
- Run certbot


### Install

```
npm i -g nginx-gen
```

### Run

```
nginx-gen --help

nginx-gen -u test.com -o ./test.com.conf -p 1234
```