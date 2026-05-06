FROM nginxinc/nginx-unprivileged:alpine

WORKDIR /usr/share/nginx/html

USER root
RUN rm -rf ./*

COPY --chown=nginx:nginx index.html style.css app.js ./
COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]