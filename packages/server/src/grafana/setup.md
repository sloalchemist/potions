# Setup for Pushgateway (ONLY Prod Team)

1. Install Pushgateway

- [download](https://github.com/prometheus/pushgateway)
- [docker](https://hub.docker.com/r/prom/pushgateway)

2. Run Pushgateway

- For Docker Run

```
docker pull prom/pushgateway

docker run -d -p 9091:9091 prom/pushgateway
```

- For Binary unpack the tarball and run

# SetUp for Graphana Cloud and Prometheus

1. Install Prometheus [download](https://prometheus.io/download/)
2. Login into Graphana Cloud and Navigate to MyAccount
3. Find Graphana Cloud Stack and Click Details
4. Find Prometheus and Click Details
5. Find and Record Prometheus Write URL and Username
6. Generate Prometheus Access Token and Record
7. Now edit Prometheus Config (prometheus.yml in installation area) [startup help](https://prometheus.io/docs/introduction/first_steps/)

```
global:
  scrape_interval: 10s # Subject to change
remote_write:
  - url: <URL>
    basic_auth:
      username: <USERNAME>
      password: <TOKEN>
scrape_configs:
  - job_name: pushgateway
    Honor_labels: true
    static_configs:
      - targets: [<PUSHGATEWAY_URL>]

  # Below is prometheus self scraping
  - job_name: node
    static_configs:
      - targets: ["localhost:9090"]
```

8. Now start Prometheus and Potions
9. Prometheus Should Now Be Shipping Data to Graphana Cloud
