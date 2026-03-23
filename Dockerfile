FROM mcr.microsoft.com/playwright:v1.58.2-noble
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# (Optional) If you didn't run `npx playwright install` locally, you can do:
# RUN npx playwright install --with-deps

# Default command: run Playwright tests
ENTRYPOINT ["npx", "playwright", "test"]