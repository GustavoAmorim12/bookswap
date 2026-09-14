# Zero dependências externas — só o runtime do Node.
FROM node:20-alpine

WORKDIR /app

COPY server.js seed.js ./

EXPOSE 4000

CMD ["node", "server.js"]
