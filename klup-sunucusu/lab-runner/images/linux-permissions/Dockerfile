ARG BASE_IMAGE=debian@sha256:7ff6ba31527b9e336162fa061746c366c4b2032f4d2cff2078bea43f78efe3f8
FROM ${BASE_IMAGE}
RUN apt-get update && apt-get install -y --no-install-recommends bash util-linux coreutils && rm -rf /var/lib/apt/lists/* && useradd -u 1000 -m student
COPY incident.txt /opt/incident.txt
USER 1000:1000
WORKDIR /home/student
ENV TERM=xterm-256color
CMD ["/bin/sh", "-c", "cp /opt/incident.txt /home/student/incident.txt && chmod 644 /home/student/incident.txt && exec sleep infinity"]
