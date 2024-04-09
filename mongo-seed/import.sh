#! /bin/bash

mongoimport --host mongo_db --db microservices_product --collection products --type json --file /mongo-seed/product-data.json --jsonArray