FROM owasp/modsecurity-crs:nginx

COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/ /etc/nginx/conf.d/
COPY modsecurity/modsecurity.conf /etc/nginx/modsecurity/modsecurity.conf
COPY modsecurity/unicode.mapping /etc/nginx/modsecurity/unicode.mapping

EXPOSE 80 443

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost/nginx-health || exit 1

CMD ["nginx", "-g", "daemon off;"]
