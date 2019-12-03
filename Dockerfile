FROM node:8.16.2-buster
WORKDIR /opt/
RUN git clone https://github.com/slapec/wimm-vue.git \
    && cd /opt/wimm-vue \
    && npm install \
    && npm run build


FROM python:3.6.8
WORKDIR /opt/wimm
COPY --from=0 /opt/wimm-vue/dist ./static/
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
