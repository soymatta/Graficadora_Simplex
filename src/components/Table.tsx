import React, { useEffect, useState, useCallback, useMemo } from "react";
import { evaluate } from "mathjs";

// Definición de las propiedades del componente Table
interface TableProps {
  objetivo: "max" | "min";
  terminosFuncionObjetivo: string[];
  restricciones: string[][];
  igualdades: string[];
  utilidades: number[];
}

// Componente principal Table
export default function Table({
  objetivo,
  terminosFuncionObjetivo,
  restricciones,
  igualdades,
  utilidades,
}: TableProps) {
  // Contadores para restricciones
  var contGreater = 0;
  var contLess = 0;

  // Función para extraer coeficientes y variables de los términos
  const extraerCoeficientes = useCallback((array: string[]) => {
    const coeficientes: string[] = [];
    const variables: string[] = [];

    array.forEach((termino) => {
      // Manejo de términos negativos
      const esNegativo = termino.startsWith("-");
      const terminoPositivo = esNegativo ? termino.slice(1) : termino;

      // Encuentra el índice donde comienza la variable
      const indiceVariable = terminoPositivo.search(/[a-zA-Z]/);
      let coeficiente = terminoPositivo.slice(0, indiceVariable);
      const esArtificial = terminoPositivo.includes("MA");
      const variable = esArtificial
        ? "A" + termino.match(/\d+/)?.[0]
        : termino.match(/[a-zA-Z]\d+/)?.[0] || "";

      // Si no hay coeficiente explícito, es 1
      if (coeficiente === "") coeficiente = "1";
      const coeficienteFinal = esArtificial ? coeficiente + "M" : coeficiente;

      // Aplica el signo negativo si corresponde
      coeficientes.push(esNegativo ? "-" + coeficienteFinal : coeficienteFinal);
      variables.push(variable);
    });

    return {
      coeficientes,
      variables,
    };
  }, []);

  // Función para extraer aportes que no contienen 'x'
  const extraerAportes = (array: string[]) => {
    return array.filter((termino) => !termino.includes("x"));
  };

  // Uso de useMemo para calcular aportes
  const aportes = useMemo(
    () => extraerAportes(terminosFuncionObjetivo),
    [terminosFuncionObjetivo]
  );

  // Estado para el ID del valor crítico
  const [valorCriticoId, setValorCriticoId] = useState<string | null>(null);

  // Efecto para manejar el cálculo y el resaltado de celdas
  useEffect(() => {
    const resultElements = Array.from(
      document.querySelectorAll('[id^="result-"]')
    );
    if (resultElements.length > 0) {
      const valores = resultElements.map((el) => ({
        id: el.id,
        valor: parseFloat(el.textContent || "0"),
      }));

      // Determina el valor crítico basado en el objetivo
      const valorCritico =
        objetivo === "max"
          ? Math.max(...valores.map((v) => v.valor))
          : Math.min(...valores.map((v) => v.valor));

      const elementoCritico = valores.find((v) => v.valor === valorCritico);
      setValorCriticoId(elementoCritico?.id || null);

      // Resaltado de celdas
      const rowNumber = elementoCritico?.id.split("-")[1];
      var bgColor = "#ff8787";
      const tds_ths = document.querySelectorAll("td, th");
      tds_ths.forEach((td_th) => {
        const element = td_th as HTMLElement;
        element.style.backgroundColor = "";
      });

      // Resaltado de celdas específicas
      const cj_zj = document.getElementById(`cj-zj-${rowNumber}`);
      const zj = document.getElementById(`zj-${rowNumber}`);
      const bi = document.getElementById(`bi-${rowNumber}`);
      const cj = document.getElementById(`cj-${rowNumber}`);

      for (let i = 0; i < restricciones.length; i++) {
        const restriccion = document.getElementById(`valor-${i}-${rowNumber}`);
        if (restriccion) {
          restriccion.style.backgroundColor = bgColor;
        }

        const Oi = document.getElementById(`Oi-${i}`);
        const utilidad = document.getElementById(`utilidad-${i}`);

        if (Oi && utilidad && restriccion) {
          if (Number(restriccion.textContent) !== 0) {
            Oi.textContent = (
              Number(utilidad.textContent) / Number(restriccion.textContent)
            ).toString();
          } else Oi.textContent = "Ind.";
        }
      }

      // Resaltado de celdas críticas
      if (cj_zj && zj && bi && cj) {
        cj_zj.style.backgroundColor = bgColor;
        zj.style.backgroundColor = bgColor;
        bi.style.backgroundColor = bgColor;
        cj.style.backgroundColor = bgColor;
      }

      // Lógica para determinar la celda pivote
      const Ois = Array.from(document.querySelectorAll('[id^="Oi-"]'))
        .map((el) => el.textContent)
        .filter((el) => el !== "Ind.");

      let OiPivote;

      if (Ois.length == 1) {
        OiPivote = Ois[0];
      }

      // Condición de celda pivote
      switch (objetivo) {
        case "max":
          OiPivote = Math.min(...Ois.map((el) => Number(el)));
          break;
        case "min":
          OiPivote = Math.max(...Ois.map((el) => Number(el)));
          break;
      }

      // Obtener el elemento Oi que coincide con OiPivote
      const elementosOis = Array.from(document.querySelectorAll('[id^="Oi-"]'));
      const idElementoPivote = elementosOis.find(
        (el) => el.textContent === OiPivote?.toString()
      )?.id;

      // Sacar el índice de la fila
      const filaPivote = idElementoPivote?.split("-")[1];

      // Resaltar la fila pivote
      const elementoOiPivote = document.getElementById("Oi-" + filaPivote);
      const utilidadPivote = document.getElementById("utilidad-" + filaPivote);
      const ciPivote = document.getElementById("ci-" + filaPivote);
      const vbPivote = document.getElementById("vb-" + filaPivote);

      for (let i = 0; i < terminosFuncionObjetivo.length; i++) {
        const elementoValor = document.getElementById(
          "valor-" + filaPivote + "-" + i
        );
        if (elementoValor) {
          elementoValor.style.backgroundColor = bgColor;
        }
      }

      // Asignar color a la fila pivote
      if (elementoOiPivote && utilidadPivote && ciPivote && vbPivote) {
        elementoOiPivote.style.backgroundColor = bgColor;
        utilidadPivote.style.backgroundColor = bgColor;
        ciPivote.style.backgroundColor = bgColor;
        vbPivote.style.backgroundColor = bgColor;
      }
    }
  }, [objetivo]);

  // Modificar el estilo de las celdas en la última fila
  const getResultStyle = (id: string) => {
    return id === valorCriticoId ? { color: "red", fontWeight: "bold" } : {};
  };

  const tableRef = React.useRef<HTMLTableElement>(null);

  return (
    <section>
      <table ref={tableRef}>
        <caption>
          <h2>Iteración #1</h2>
        </caption>
        <thead>
          <tr>
            <th></th>
            <th></th>
            <th className="font-bold">Cj</th>
            {extraerCoeficientes(terminosFuncionObjetivo).coeficientes.map(
              (termino, index) => (
                <th key={index} id={"cj-" + index}>
                  {termino}
                </th>
              )
            )}
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="font-bold">Ci</td>
            <td className="font-bold">Vb</td>
            <td className="font-bold">Bi</td>
            {extraerCoeficientes(terminosFuncionObjetivo).variables.map(
              (termino, index) => (
                <td key={index} id={"bi-" + index}>
                  {termino}
                </td>
              )
            )}
            <td className="font-bold">Oi</td>
          </tr>

          {igualdades.map((_, index) => (
            <tr key={index}>
              {(() => {
                const esGreaterEqual = igualdades[index] === ">=";
                let pos;

                if (esGreaterEqual) {
                  const tempGreater = contGreater++;
                  pos = contLess + tempGreater * 2 + 1;
                } else {
                  const tempLess = contLess++;
                  pos = contGreater * 2 + tempLess;
                }

                const { coeficientes, variables } =
                  extraerCoeficientes(aportes);

                return (
                  <>
                    <td id={"ci-" + index}>{coeficientes[pos]}</td>
                    <td id={"vb-" + index}>{variables[pos]}</td>
                    <td id={"utilidad-" + index}>{utilidades[index]}</td>
                    {extraerCoeficientes(restricciones[index]).coeficientes.map(
                      (coeficiente: string, j) => (
                        <td key={j} id={"valor-" + index + "-" + j}>
                          {coeficiente}
                        </td>
                      )
                    )}
                    <td id={`Oi-${index}`}>Temp</td>
                  </>
                );
              })()}
            </tr>
          ))}
          <tr>
            <td></td>
            <td>Zj</td>
            <td></td>
            {terminosFuncionObjetivo.map((_: string, i) => {
              let result = 0;
              let haveM = false;

              for (let j = 0; j < restricciones.length; j++) {
                let celda = document.getElementById(
                  "valor-" + j + "-" + i
                )?.textContent;

                let ci = document.getElementById("ci-" + j)?.textContent;

                if (celda?.includes("M") || ci?.includes("M")) {
                  haveM = true;
                }
                celda = celda?.replace("M", "");
                ci = ci?.replace("M", "");
                result += Number(celda) * Number(ci);
              }

              return (
                <td key={"zj-" + i} id={"zj-" + i}>
                  {result.toString()}
                  {haveM ? "M" : ""}
                </td>
              );
            })}
          </tr>
          <tr>
            <td></td>
            <td>Cj-Zj</td>
            <td></td>
            {terminosFuncionObjetivo.map((_: string, i) => {
              const zj = document.getElementById("zj-" + i)?.textContent;
              const cj = document.getElementById("cj-" + i)?.textContent;

              let result;

              if (zj === cj) {
                result = 0;
              } else if (zj?.includes("M") && !cj?.includes("M")) {
                const cjNum = Number(cj);
                result = cjNum !== 0 ? `${cjNum} - (${zj})` : `-(${zj})`;
              } else if (!zj?.includes("M") && cj?.includes("M")) {
                const zjNum = Number(zj) * -1;
                result = zjNum !== 0 ? `${zjNum} + ${cj}` : cj;
              } else if (zj?.includes("M") && cj?.includes("M")) {
                let zjClean = zj?.replace("M", "");
                let cjClean = cj?.replace("M", "");
                const diff = Number(cjClean) - Number(zjClean);
                result = diff !== 0 ? `${diff}M` : "0";
              } else {
                result = Number(cj) - Number(zj) * -1;
              }

              // Limpieza del resultado si es string
              if (typeof result === "string") {
                const originalResult = result;
                result = result
                  .replace(/(\d+|\w+)\s*-\s*\(\s*-/g, "$1 + ")
                  .replace(/^-\s*\(\s*-/, "");

                if (result !== originalResult) {
                  result = result.replace(/\)\s*(?=[\s+]|$)/g, "");
                }
              }

              return (
                <td key={"cj-zj-" + i} id={"cj-zj-" + i}>
                  {result}
                </td>
              );
            })}
          </tr>
          {(() => {
            const hasAnyM = terminosFuncionObjetivo.some((_, i) =>
              document.getElementById(`cj-zj-${i}`)?.textContent?.includes("M")
            );

            return hasAnyM ? (
              <tr id="tr-footer">
                <td></td>
                <td></td>
                <td></td>
                {terminosFuncionObjetivo.map((_: string, i) => {
                  let cj_zj = document
                    .getElementById(`cj-zj-${i}`)
                    ?.textContent?.replace(/M/g, "(100)");

                  let result = 0;

                  // Evaluar cj_zj
                  try {
                    const formattedInput = cj_zj?.replace(/(\d)\(/g, "$1*(");
                    result = evaluate(formattedInput || "");
                  } catch (error) {
                    console.error("Error al evaluar la expresión:", error);
                  }

                  return (
                    <td
                      key={`footer-${i}`}
                      id={`result-${i}`}
                      style={getResultStyle(`result-${i}`)}
                    >
                      {result}
                    </td>
                  );
                })}
              </tr>
            ) : null;
          })()}
        </tbody>
      </table>
    </section>
  );
}
