import React, { useState } from "react";
import TablaSimplex from "./components/Table";

export default function App() {
  const [cantTerminos, setCantTerminos] = useState(2);
  const [cantRestricciones, setCantRestricciones] = useState(2);
  const [objetivo, setObjetivo] = useState("max");
  const objetivoEstandarizado = objetivo === "max" ? "min" : "max";
  const [igualdades, setIgualdades] = useState<string[]>(
    Array(cantRestricciones).fill("=")
  );
  const [updateKey, setUpdateKey] = useState(0);

  var cantAiObjetivo = 1;
  var cantSiObjetivo = 1;
  var cantAiRestricciones = 1;
  var cantSiRestricciones = 1;

  // Función para estandarizar el modelo de PL
  function estandarizar(objetivo: string, igualdad: string, data: string) {
    let returnValue =
      data === "objetivo"
        ? { ai: cantAiObjetivo++, si: cantSiObjetivo++ }
        : { ai: cantAiRestricciones++, si: cantSiRestricciones++ };

    if (objetivo === "max" && igualdad === "=") {
      return data === "objetivo"
        ? "- MA" + returnValue.ai + " "
        : "+ A" + returnValue.ai + " ";
    } else if (objetivo === "max" && igualdad === ">=") {
      return data === "objetivo"
        ? "+ 0S" + returnValue.si + " - MA" + returnValue.ai + " "
        : "- S" + returnValue.si + " + A" + returnValue.ai + " ";
    } else if (objetivo === "max" && igualdad === "<=") {
      return data === "objetivo"
        ? "+ 0S" + returnValue.si + " "
        : "+ S" + returnValue.si + " ";
    } else if (objetivo === "min" && igualdad === "=") {
      return data === "objetivo"
        ? "+ MA" + returnValue.ai + " "
        : "+ A" + returnValue.ai + " ";
    } else if (objetivo === "min" && igualdad === ">=") {
      return data === "objetivo"
        ? "+ 0S" + returnValue.si + " + MA" + returnValue.ai + " "
        : "- S" + returnValue.si + " + A" + returnValue.ai + " ";
    } else if (objetivo === "min" && igualdad === "<=") {
      return data === "objetivo"
        ? "+ 0S" + returnValue.si + " "
        : "+ S" + returnValue.si + " ";
    }
  }

  return (
    <>
      {/*Tabla de explicación para estandarizar */}
      <table>
        <caption>Estandarización de Modelos Lineales</caption>
        <thead>
          <tr>
            <th>Criterio</th>
            <th>Aporte a función Objetivo (max)</th>
            <th>Aporte a restricciones(max)</th>
            <th>Aporte a función Objetivo (min)</th>
            <th>Aporte a restricciones(min)</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>{">="}</td>
            <td>{"+ 0Si - MAi"}</td>
            <td>{"= - Si + Ai"}</td>
            <td>{"+ 0Si + MAi"}</td>
            <td>{"= - Si + Ai"}</td>
          </tr>
          <tr>
            <td>{"<="}</td>
            <td>{"+ 0Si "}</td>
            <td>{"= + Si "}</td>
            <td>{"+ 0Si"}</td>
            <td>{"= + Si"}</td>
          </tr>
          <tr>
            <td>{"="}</td>
            <td>{"- MAi"}</td>
            <td>{"= + Ai"}</td>
            <td>{"+ MAi"}</td>
            <td>{"= + Ai"}</td>
          </tr>
        </tbody>
      </table>

      {/* Inputs para modelo de PL */}
      <section>
        <h2>Variables en modelo de PL</h2>
        <p>
          Cantidad de terminos de xi:{" "}
          <select
            id="cantTerminos"
            defaultValue="2"
            onChange={(e) => setCantTerminos(Number(e.target.value))}
          >
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </p>
        <p>
          Cantidad de restricciones:{" "}
          <select
            id="cantRestricciones"
            defaultValue="2"
            onChange={(e) => setCantRestricciones(Number(e.target.value))}
          >
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </p>
        <p>
          Z (
          <select
            id="objetivo"
            defaultValue="max"
            onChange={(e) => setObjetivo(e.target.value)}
          >
            <option value="max">Max</option>
            <option value="min">Min</option>
          </select>
          ) ={" "}
          {Array.from({ length: cantTerminos }).map((_, index) => (
            <React.Fragment key={`term-z-${index}`}>
              <input
                type="number"
                name={`coeficiente-z-${index + 1}`}
                id={`coeficiente-z-${index + 1}`}
                className="border border-black w-20"
              />
              <span>x{index + 1}</span>
              {index < cantTerminos - 1 ? " + " : ""}
            </React.Fragment>
          ))}
        </p>

        <p>Sujeto a:</p>
        {Array.from({ length: cantRestricciones }).map((_, i) => (
          <p key={`restrictionFila-${i}`}>
            {Array.from({ length: cantTerminos }).map((_, j) => (
              <React.Fragment key={`termino-${i}-${j}`}>
                <input
                  type="number"
                  name={`restriccion-${i + 1}-${j + 1}`}
                  id={`restriccion-${i + 1}-${j + 1}`}
                  className="border border-black w-20"
                />
                <span>x{j + 1}</span>
                {j < cantTerminos - 1 ? " + " : ""}
              </React.Fragment>
            ))}{" "}
            <select
              value={igualdades[i]}
              onChange={(e) => {
                const newIgualdades = [...igualdades];
                newIgualdades[i] = e.target.value;
                setIgualdades(newIgualdades);
              }}
            >
              <option value="=">=</option>
              <option value="<=">≤</option>
              <option value=">=">≥</option>
            </select>{" "}
            <input
              type="number"
              name={`utilidad-input-${i + 1}`}
              id={`utilidad-input-${i + 1}`}
              className="border border-black w-20"
            />
          </p>
        ))}
        <input
          className="border border-black"
          type="button"
          value="Resolver"
          onClick={() => setUpdateKey((prev) => prev + 1)}
        />
      </section>

      {/* PL estandarizado */}
      <section>
        <h2> PL estandarizado</h2>
        <p>Mostramos el PL estandarizado:</p>
        <p id="funcion-objetivo-estandar">
          Z({objetivoEstandarizado}) ={" "}
          {Array.from({ length: cantTerminos }).map((_, index) => (
            <React.Fragment key={`coeficiente-y-${index + 1}`}>
              {
                (
                  document.getElementById(
                    `coeficiente-z-${index + 1}`
                  ) as HTMLInputElement
                )?.value
              }
              x{index + 1} {index < cantRestricciones - 1 ? " + " : ""}
            </React.Fragment>
          ))}
          {Array.from({ length: cantRestricciones }).map((_, index) => (
            <React.Fragment key={`coeficiente-y-${index + 1}`}>
              {estandarizar(objetivo, igualdades[index], "objetivo")}
            </React.Fragment>
          ))}
          {Array.from({ length: cantRestricciones }).map((_, index) => (
            <React.Fragment key={`igualdad-Objetivo-${index}`}>
              {index === cantRestricciones - 1 ? " = " : ""}
            </React.Fragment>
          ))}
        </p>
        <p>Sujeto a:</p>
        {Array.from({ length: cantRestricciones }).map((_, i) => (
          <p
            key={`restriccion-estandar-${i + 1}`}
            id={`restriccion-estandar-${i + 1}`}
          >
            {Array.from({ length: cantTerminos }).map((_, j) => (
              <React.Fragment key={`coeficiente-y-${j + 1}`}>
                {
                  (
                    document.getElementById(
                      `restriccion-${i + 1}-${j + 1}`
                    ) as HTMLInputElement
                  )?.value
                }
                x{j + 1} {j < cantRestricciones - 1 ? " + " : ""}
              </React.Fragment>
            ))}
            <React.Fragment key={`aportes-${i + 1}`}>
              {estandarizar(objetivo, igualdades[i], "restricciones")}
            </React.Fragment>
            {" = " +
              (document.getElementById(`utilidad-${i + 1}`) as HTMLInputElement)
                ?.value}
          </p>
        ))}
      </section>

      <TablaSimplex
        key={updateKey}
        objetivo={objetivo as "max" | "min"}
        terminosFuncionObjetivo={["9x1", "8x2", "0S1", "MA1", "0S2", "MA2"]}
        restricciones={[
          ["1x1", "2x2", "-1S1", "1A1", "0S2", "0A2"],
          ["3x1", "1x2", "0S1", "0A1", "-1S2", "1A2"],
        ]}
        igualdades={[">=", ">="]}
        utilidades={[20, 40]}
      />

      <p>Mostrar ecuaciones de calculo para las nuevas celdas</p>
      <p>Resultado</p>
    </>
  );
}
