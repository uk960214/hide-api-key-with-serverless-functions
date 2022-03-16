const fetch = require("node-fetch");
const stringify = require("../utils/stringify.js");

const GOOGLEAPIS_ORIGIN = "https://www.googleapis.com";
const headers = {
  "Access-Control-Allow-Origin": process.env.HOST,
  "Content-Type": "application/json; charset=utf-8",
};

exports.handler = async (event) => {
  const {
    path,
    queryStringParameters,
    headers: { referer },
  } = event;

  const url = new URL(path, GOOGLEAPIS_ORIGIN);
  const parameters = Object.keys(queryStringParameters).reduce(
    (searchParams, key) => {
      searchParams.append(key, queryStringParameters[key]);
      return searchParams;
    },
    new URLSearchParams({
      key: process.env.API_KEY,
    })
  );

  url.search = parameters;

  try {
    const response = await fetch(url, { headers: { referer } });
    const body = await response.json();

    if (body.error) {
      return {
        statusCode: body.error.code,
        ok: false,
        headers,
        body: stringify(body),
      };
    }

    return {
      statusCode: 200,
      ok: true,
      headers,
      body: stringify(body),
      parameters: queryStringParameters,
    };
  } catch (error) {
    return {
      statusCode: 400,
      ok: false,
      headers,
      body: stringify(error),
    };
  }
};
