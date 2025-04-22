# Database design

[database design](https://lucid.app/lucidchart/1eeec016-f3d1-4ab1-9c95-58dee27f16af/edit?invitationId=inv_98bb3e41-4479-4bec-b8b5-dd211c98fa60&page=0_0#)

[live server](http://209.97.134.184:8001)

-------------

server {
    listen 80;
    server_name mytrackss.com https://mytrackss.com;
      location / {
        proxy_pass http://209.97.134.184:4174;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 20M; # Adjust the value based on your needs
    }

    error_page 404 /404.html;
    location = /404.html {
        root /var/www/errors;
   }
}


server {
    server_name api.mytrackss.com;

    location / {
        proxy_pass http://209.97.134.184:8001;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 20M; # Adjust the value based on your needs
    }

    error_page 404 /404.html;
    location = /404.html {
        root /var/www/errors;
   }
}


server {
    server_name admin.mytrackss.com;

    location / {
        proxy_pass http://209.97.134.184:4173;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 20M; # Adjust the value based on your needs
    }

    error_page 404 /404.html;
    location = /404.html {
        root /var/www/errors;
   }
}

