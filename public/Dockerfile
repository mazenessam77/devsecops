FROM nginxinc/nginx-unprivileged:alpine

WORKDIR /usr/share/nginx/html

USER root
RUN rm -rf ./*

COPY --chown=nginx:nginx . .

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]