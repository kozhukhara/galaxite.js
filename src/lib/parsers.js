const qs = require("querystring");
const formidable = require("formidable");
const { existsSync, mkdirSync } = require("fs")

const handleDirectory = (directoryPath) => {
  if (!existsSync(directoryPath)) {
    mkdirSync(directoryPath, { recursive: true });
  }
};

const getBody = async (request, uploadDir) => {
  return new Promise(async (ok, fail) => {
    if (!!uploadDir) handleDirectory(uploadDir)
    const form = new formidable.IncomingForm({ multiples: true, keepExtensions: true, uploadDir });
    form.parse(request, (err, fields, files) => {
      if (err) return fail(err)
      ok({ fields, files })
    })
  })
};

const extractParamNames = (pattern) => {
  const patternParts = pattern.split("/");
  let paramNames = [];
  let hasWildcard = false;

  patternParts.forEach((part) => {
    if (part.startsWith(":")) {
      paramNames.push(part.slice(1));
    } else if (part === "*") {
      if (hasWildcard) {
        throw new Error(
          "Wildcard (*) can only appear once and must be at the end of the pattern"
        );
      }
      paramNames.push("slug");
      hasWildcard = true;
    }
  });

  return paramNames;
};

const patternToRegex = (pattern) => {
  if (pattern.startsWith("/")) pattern = pattern.substring(1);
  if (pattern.endsWith("/")) pattern = pattern.substring(0, pattern.length - 1);
  return new RegExp(
    `^${pattern
      .split("/")
      .map((part) => {
        if (part.startsWith(":")) {
          return "/([^/]+)";
        } else if (part === "*") {
          return "(?:\\/(.*))?";
        } else {
          return `\/${part}`;
        }
      })
      .join("")}$`
  );
};

const parseCookies = (request) => {
  const cookieString = request.headers.cookie || '';
  return cookieString.split(';').reduce((cookies, cookie) => {
    const [key, value] = cookie.split('=').map(c => c.trim());
    cookies[key] = value;
    return cookies;
  }, {});
};

module.exports = { getBody, extractParamNames, patternToRegex, parseCookies, qs };
