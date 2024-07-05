---

title: "Early Speed Breaker Detection" 
summary: Aims to reduce road accidents caused by speed breakers and potholes, by alerting the driver in advance about an incoming speed breaker and in the process also create a database of all existing speed breakers
ShowToc: true
---
## Problem Statement

Every day, on an average 9 deaths are reported, which are caused due to speed breakers and potholes. Reasons for this could be poor visibility or the driver not paying attention while driving/riding

## Solution
This project aims to reduce road accidents caused by speed breakers and potholes, by alerting the driver in advance about an incoming speed breaker or pothole and in the process also create a database of all existing speed breakers

## Steps taken to achieve the desired solution
1. Get the location of all existing speed breakers
    - We use people's phone and the sensor and geolocation data from the device to determine the presence of speed breakers
2. Train a ML model to classify whether the data received from accelorometer of smart phones and devices belongs to speed breaker, potholes or is just an arbitary sensor value 
    - Create a new dataset as we don't have access to any existing dataset online
3. For a given geo-location (lat, long), atleast N devices shall also agree upon the presence of speed breaker at (lat, long)  
4. Eventually over the time as people drive around, we collect data and plot out all the speed breaker locations.
    - This approach helps us adapt to dynamic road conditions, especially in India
5. Once, we have the geolocation of all speed breakers we can notify anyone who is approaching that geolocation (will require user to connect to our service)

## Tech used
- Django web framework, for backend 
- A simple html page with JS functions to handle sending and receiving of data
- Tensorflow, to train RNN model to classify the sensor data into speed breakers or arbitary reading 
 
