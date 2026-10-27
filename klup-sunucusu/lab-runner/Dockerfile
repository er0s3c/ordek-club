# Controller only. Student containers are created separately with --runtime=runsc.
ARG DOCKER_CLI_IMAGE=docker@sha256:5e6baf67325a79f64ed3bed6863954d5e05d0f3d4e57cbdb14809346814bbfdb
ARG RUNNER_NODE_IMAGE=node@sha256:de170b39439eb0e5a3444ad7d60b015614a381e10fecae2e30ec9e735122f38d
FROM ${DOCKER_CLI_IMAGE} AS docker-cli
FROM ${RUNNER_NODE_IMAGE}
WORKDIR /runner
COPY --from=docker-cli /usr/local/bin/docker /usr/local/bin/docker
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund
COPY server.mjs start.mjs policy.mjs healthcheck.mjs ./
USER 1000:1000
EXPOSE 9443
CMD ["node", "start.mjs"]
