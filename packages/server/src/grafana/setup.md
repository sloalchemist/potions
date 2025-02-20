# SetUp for Graphana Cloud (Prod Team)
1. Install Prometheus [download](https://prometheus.io/download/)
2. Login into Graphana Cloud and Navigate to MyAccount
3. Find Graphana Cloud Stack and Click Details 
4. Find Prometheus and Click Details
5. Find and Record Prometheus URL and Username
6. Generate Prometheus Access Token and Record
7. Now edit Prometheus Config (prometheus.yml in installation area) [startup help](https://prometheus.io/docs/introduction/first_steps/)
```
global:
  scrape_interval: 60s
remote_write:
  - url: <URL>
    basic_auth:
      username: <USERNAME>
      password: <TOKEN>
scrape_configs:
  - job_name: node
    static_configs:
      - targets: ["localhost:3030"] 

```
8. Now start Prometheus and Potions 
9. Prometheus Should Now Be Shipping Data to Graphana Cloud