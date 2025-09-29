nginx_conf = '''
http {
    server {
        listen 80;
        server_name mydatagpt.cloud;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$host$request_uri;
        }
    }

    server {
        listen 443 ssl;
        server_name mydatagpt.cloud;

        ssl_certificate /etc/letsencrypt/live/mydatagpt.cloud/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/mydatagpt.cloud/privkey.pem;

        resolver 127.0.0.11 valid=30s;

        location /personal-backend {
            set $personal_backend "http://personal-backend:3000";
            proxy_pass $personal_backend;
        }

        location /chatgpt-backend {
            set $chatgpt_backend "http://chatgpt-backend:3001";
            proxy_pass $chatgpt_backend;
        }

        location / {
            set $frontend "http://frontend:8080";
            proxy_pass $frontend;
        }
    }
}
'''

with open('/home/mastenmind/mydatagpt/reverse-proxy/nginx.conf', 'w') as f:
    f.write(nginx_conf)