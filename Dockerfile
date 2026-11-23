FROM node:26.13.1-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && mkdir -p /app/.data && chown node:node /app/.data
COPY --chown=node:node . .
USER node
ENV PORT=3000
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "app.js"]
