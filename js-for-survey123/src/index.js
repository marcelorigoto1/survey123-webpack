import booleanIntersects from "@turf/boolean-intersects";
import nearestPoint from "@turf/nearest-point";
import { point } from "@turf/helpers";
import { featureCollection } from "@turf/helpers";
import pointsWithinPolygon from "@turf/points-within-polygon";
import { lineString } from "@turf/helpers";

//-----------------------------------------Início do código----------------------------------------//
//
//  Transformam as linhas desenhados dos surveys, sendo necessário retirar o campo de altura 
//  e os colchetes para a função de FeatureCollection conseguir agrupar os pontos como uma reta
//
//-------------------------------------------------------------------------------------------------//

function transformaJsonLinha(survey123Linha) {
  let tracado = (survey123Linha);
  let tiraAltitude = JSON.stringify(tracado).replace(/,0]/g, "]");
  let tiraFinal = ((tiraAltitude).replace(']]]', ']]'));
  let tiraComeco = ((tiraFinal).replace('[[[', '[['));
  let linhaString = JSON.parse(tiraComeco);
  return linhaString;
}

//-------------------------------------------------------------------------------------------------//
//
//  Transformam os poligonos desenhados dos surveys, sendo necessário retirar o campo de altura 
//  e os colchetes para a função de FeatureCollection conseguir agrupar os pontos 
//  como um poligono para o intersect
//
//-------------------------------------------------------------------------------------------------//

function transformaJsonPoligono(survey123Poligono) {
  let poligonoString = featureCollection(survey123Poligono);
  let tiraAltitude = JSON.stringify(poligonoString).replace(/,0]/g, "]");
  let tiraComeco = (tiraAltitude).replace('{"type":"FeatureCollection","features":{"spatialReference":{"wkid":4326},"rings":',
                                          '[{"type":"Feature","id":1,"geometry":{"type":"Polygon","coordinates":');
  let tiraFinal = ((tiraComeco).replace(']]]}}', ']]]}}]'));
  let poligono = JSON.parse(tiraFinal);
  return poligono;
}

//-------------------------------------------------------------------------------------------------//
//
//  Funções para puxarem os JSONs das áreas de proteção ambiental 
//  e intersectarem com as linhas inputados pelos usuários
//  atráves da função de booleanIntersects da biblioteca TURF.js
//
//-------------------------------------------------------------------------------------------------//

function checkLineIntersection(survey123Line, filePath) {
  try {
    let jsonPolygon = filePath;
    let polygonCollection = featureCollection(jsonPolygon);
    let tracado = transformaJsonLinha(survey123Line);
    let linestring = lineString(tracado.paths, { name: 'linha' });
    let intersection = booleanIntersects(linestring, polygonCollection);
    return intersection ? 'Verdadeiro' : 'Falso';
  } catch (e) {
    return JSON.stringify({ error: e.message });
  }
}

export function intersectLinhaIndigena(survey123Line) {
  return checkLineIntersection(survey123Line, require('./TI_SC.json'));
}

export function intersectLinhaApp(survey123Line) {
  return checkLineIntersection(survey123Line, require('./APP_SC.json'));
}

export function intersectLinhaUnidade(survey123Line) {
  return checkLineIntersection(survey123Line, require('./UCs_SC.json'));
}


//-------------------------------------------------------------------------------------------------//
//
//  Funções para puxarem os JSONs das áreas de proteção ambiental 
//  e intersectarem com os poligonos inputados pelos usuários
//  atráves da função de booleanIntersects da biblioteca TURF.js
//
//-------------------------------------------------------------------------------------------------//

function checkIntersection(survey123Poligono, filePath) {
  try {
    let jsonPolygon = filePath;
    let polygonCollection = featureCollection(jsonPolygon);
    let poligono = transformaJsonPoligono(survey123Poligono);
    let poligonoTransform = featureCollection(poligono);
    let intersection = booleanIntersects(poligonoTransform, polygonCollection);
    return intersection ? 'Verdadeiro' : 'Falso';
  } catch (e) {
    return JSON.stringify({ error: e.message });
  }
}

export function intersectIndigena(survey123Poligono) {
  return checkIntersection(survey123Poligono, require('./TI_SC.json'));
}

export function intersectApp(survey123Poligono) {
  return checkIntersection(survey123Poligono, require('./APP_SC.json'));
}

export function intersectUnidade(survey123Poligono) {
  return checkIntersection(survey123Poligono, require('./UCs_SC.json'));
}

//-------------------------------------------------------------------------------------------------//
//
//  Funções para puxarem os JSONs das áreas de proteção ambiental 
//  e compararem com os pontos atraves da função de WithinPolygon 
//  da biblioteca TURF.js inputados pelos usuários
//
//-------------------------------------------------------------------------------------------------//

function checkWithinPolygon(input, filePath) {
  try {
    var target = filePath;
    var targetFeature = featureCollection(target);
    var lat = JSON.stringify(input.x);
    var long = JSON.stringify(input.y);
    var inputPonto = point([lat, long], { name: 'Ponto de Input' });
    var dentro = pointsWithinPolygon(inputPonto, targetFeature);
    var final = JSON.stringify(dentro.features);
    return final.length < 3 ? 'Falso' : 'Verdadeiro';
  } catch (e) {
    return JSON.stringify({ error: e.message });
  }
}

export function withinApp(input) {
  return checkWithinPolygon(input, require('./APP_SC.json'));
}

export function withinIndigena(input) {
  return checkWithinPolygon(input, require('./TI_SC.json'));
}

export function withinUnidade(input) {
  return checkWithinPolygon(input, require('./UCs_SC.json'));
}

//-------------------------------------------------------------------------------------------------//
//
//  Funções para puxarem os JSONs dos trechos
//  e pegarem a propriedade trecho dos pontos mais perto do ponto inputado pelo usuário
//  através da função nearestPoint da biblioteca TURF.js
//
//-------------------------------------------------------------------------------------------------//

function getNearestProperty(acesso, property) {
  try {
      var arquivo = require('./TLT_SC.json');
      var pontos_arquivo = featureCollection(arquivo);
      var lat = JSON.stringify(acesso.x);
      var long = JSON.stringify(acesso.y);
      var locationA = point([lat, long], { name: 'Ponto de Input' });
      var local = nearestPoint(locationA, pontos_arquivo);
      var name = local.properties[property];
      return name;
  } catch (e) {
      return JSON.stringify({ error: e.message });
  }
}

export function getNearest(acesso) {
  return getNearestProperty(acesso, 'LOCAL_INSTALACAO');
}

export function getTorre(acesso) {
  return getNearestProperty(acesso, 'NOME_ESTRUT');
}

export function getLinha(acesso) {
  return getNearestProperty(acesso, 'LT_SAP');
}

export function getCentro(acesso) {
  return getNearestProperty(acesso, 'NOME_CENTRO_MAN');
}

export function getArea(acesso) {
  return getNearestProperty(acesso, 'AREA_OPE');
}


export { dev } from "./survey123/lib.js";

export { debugTerminal } from "./survey123/lib.js";
