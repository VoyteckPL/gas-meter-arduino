ARG BUILD_FROM
FROM $BUILD_FROM

RUN apk add --no-cache python3 py3-aiohttp py3-paho-mqtt tzdata

COPY app /app
COPY run.sh /run.sh

RUN chmod +x /run.sh

WORKDIR /app

CMD ["/run.sh"]
