#!/bin/bash
cd ~/GlobalEduSupport
git pull origin main
cd backend
npm install
pkill node
npm run dev
