import React, { useState, useEffect } from "react";
import { FaSolarPanel, FaTimesCircle } from "react-icons/fa";
import { GiPowerGenerator } from "react-icons/gi";
import { AiFillDatabase } from "react-icons/ai";
import { motion } from "framer-motion";
import jsPDF from "jspdf";

function App() {
  const [mode, setMode] = useState("");        // "Hybrid" or "Off-Grid"
  const [value, setValue] = useState("");      // Genset kWm or Electricity kWh
  const [confirmed, setConfirmed] = useState(false);

  // step 2: hybrid
  const defaultHours = 8;
  const [phase, setPhase] = useState("");
  const [operatingM, setOperatingM] = useState("");
  const [kva, setKva] = useState("");
  const [operatingHours, setOperatingHours] = useState(defaultHours);
  const [showPresets, setShowPresets] = useState(false);
  const [gensetLiters, setGensetLiters] = useState("");
  const [showEstimateMsg, setShowEstimateMsg] = useState(false);
  const [calcDetails, setCalcDetails] = useState(null);

  // step 2: off-grid
  const [errorMessage, setErrorMessage] = useState("");  

  // Custom Appliance
  const [customText, setCustomText] = useState(
    "Electrical appliances – HorsePower – Quantity – Hours/day\n" +
    "Example: Air Conditioner – 1.5 HP – 1 unit – 8 hours/day\n\n" +
    "1. \n" +
    "2. \n" +
    "3. \n\n" +
    "Please calculate the kWh/day for these appliances"
  );
  const [copyMessage, setCopyMessage] = useState("");

  // step 3: hybrid
  const [dieselSaving, setDieselSaving] = useState(0); // % saving from genset

  // Auto update based on mode
  useEffect(() => {
    if (mode === "Hybrid") {
      setDieselSaving(50);
    } else if (mode === "Standby") {
      setDieselSaving(100);
    }
  }, [mode]);

  // Step 1: Select mode
  if (!mode) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
        <h2>Select your system type</h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column", // 👈 stack vertically instead of side by side
            alignItems: "center",
            gap: "20px", // spacing between buttons
            marginTop: "20px",
          }}
        >
          
          {/* Hybrid Button */}
          <button
            onClick={() => setMode("Hybrid")}
            style={{
              width: 250,
              height: 150,
              padding: "15px",
              fontSize: "16px",
              cursor: "pointer",
              borderRadius: "12px",
              border: "1px solid #ccc",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              color: "#fff",
              backgroundColor: "#007BFF",
            }}
          >
            <strong>Solar + Battery <br /> + Genset (Hybrid Mode)</strong>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <FaSolarPanel size={40} />
              <AiFillDatabase size={40} />
              <GiPowerGenerator size={40} />
            </div>
          </button>

          {/* Standby Button */}
          <button
            onClick={() => setMode("Standby")}
            style={{
              width: 250,
              height: 150,
              padding: "15px",
              fontSize: "16px",
              cursor: "pointer",
              borderRadius: "12px",
              border: "1px solid #ccc",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              color: "#fff",
              backgroundColor: "#6A5ACD",
            }}
          >
            <strong>Solar + Battery <br /> + Genset (Standby Mode)</strong>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <FaSolarPanel size={40} />
              <AiFillDatabase size={40} />
              <GiPowerGenerator size={40} />
            </div>
          </button>

          {/* Off-Grid Button */}
          <button
            onClick={() => setMode("Off-Grid")}
            style={{
              width: 250,
              height: 150,
              padding: "15px",
              fontSize: "16px",
              cursor: "pointer",
              borderRadius: "12px",
              border: "1px solid #ccc",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              background: "#fff",
              backgroundColor: "#FF8C00",
            }}
          >
            <strong>Solar + Battery (Off-Grid)</strong>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <FaSolarPanel size={40} />
              <AiFillDatabase size={40} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "16px", color: "#D2042D" }}>
              <FaTimesCircle /> <strong>No TNB</strong>
            </div>
          </button>
        </div>
        </motion.div>
      </div>
    );
  }

  // Step 2: Ask user-specific input
  if (!confirmed) {
    return (
      <div style={styles.container}>
        <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{ position: "relative", minHeight: "50px" }}>
            {/* Back button at top-left */}
            <button
              style={{
                position: "absolute",
                left: "10px",
                padding: "10px 20px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                cursor: "pointer",
                background: "#f5f5f5",
              }}
              onClick={() => {
                // reset everything
                setMode("");
                setPhase("");
                setOperatingM("");
                setKva("");
                setCalcDetails(null);
                setValue("");
                setErrorMessage("")
                setOperatingHours(8)
                setGensetLiters("")
                setCustomText(
                  "Electrical appliances – HorsePower – Quantity – Hours/day\n" +
                  "Example: Air Conditioner – 1.5 HP – 1 unit – 8 hours/day\n\n" +
                  "1. \n" +
                  "2. \n" +
                  "3. \n\n" +
                  "Please calculate the kWh/day for these appliances"
                );
              }}
            >
              ← Back
            </button>
          </div>


        <h2>{mode} Mode System Setup</h2>

        {mode === "Hybrid" || mode === "Standby"? (
          <>
            <div style={styles.card}>
              <p>Please select your genset phase first:</p>

              {/* Phase Selection */}
              <div style={{ marginTop: "10px" }}>
                <label>
                  <input
                    type="radio"
                    name="phase"
                    value="single"
                    checked={phase === "single"}
                    onChange={(e) => setPhase(e.target.value)}
                  />{" "}
                  Single Phase
                </label>
                <br />
                <label>
                  <input
                    type="radio"
                    name="phase"
                    value="three"
                    checked={phase === "three"}
                    onChange={(e) => setPhase(e.target.value)}
                  />{" "}
                  Three Phase
                </label>
              </div>
            </div>

            {/* Show genset details only if phase is selected */}
            {phase && (
              <>
                <br />
                <p style={{ textAlign: "center", marginTop: "15px" }}>
                  <strong>Please enter your genset details</strong>:
                </p>

                <div style={styles.card}>
                  {/* Quick Presets Dropdown */}
                  <div style={{ marginTop: "20px", textAlign: "center" }}>
                    <button
                      onClick={() => setShowPresets(!showPresets)}
                      style={{
                        padding: "10px 20px",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        cursor: "pointer",
                        backgroundColor: "#f5f5f5",
                        fontWeight: "bold",
                      }}
                    >
                      💡 Quick Presets {showPresets ? "▲" : "▼"}
                    </button>

                    {showPresets && (
                      <div style={{ marginTop: "15px" }}>
                        <p
                          style={{
                            fontSize: "14px",
                            color: "#555",
                            marginBottom: "15px",
                          }}
                        >
                          These buttons let you quickly fill in common load scenarios.
                        </p>

                        <div
                          style={{
                            display: "grid",
                            justifyContent: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            style={{
                              ...styles.modeButton,
                              backgroundColor: "#4caf50",
                              minWidth: "150px",
                            }}
                            onClick={() => {
                              setKva(25);
                              setOperatingM(18);
                            }}
                          >
                            Small Usage <br />
                            <span style={{ fontSize: "12px" }}>
                              (Shops / Small Offices)
                            </span>
                          </button>

                          <button
                            style={{
                              ...styles.modeButton,
                              backgroundColor: "#2196f3",
                              minWidth: "150px",
                            }}
                            onClick={() => {
                              setKva(80);
                              setOperatingM(60);
                            }}
                          >
                            Medium Usage <br />
                            <span style={{ fontSize: "12px" }}>
                              (Restaurant / School / Factory Section)
                            </span>
                          </button>

                          <button
                            style={{
                              ...styles.modeButton,
                              backgroundColor: "#f44336",
                              minWidth: "150px",
                            }}
                            onClick={() => {
                              setKva(200);
                              setOperatingM(150);
                            }}
                          >
                            High Usage <br />
                            <span style={{ fontSize: "12px" }}>
                              (Large Factory / Hotel / Hospital)
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* kVA */}
                  <div
                    style={{ display: "block", marginTop: "15px", textAlign: "center" }}
                  >
                    <label>Genset Rating (kVA):</label>
                    <input
                      type="number"
                      value={kva}
                      onChange={(e) => setKva(e.target.value)}
                      style={{
                        ...styles.input,
                        marginTop: "8px",
                        textAlign: "center",
                      }}
                      placeholder="Enter genset kVA"
                    />
                  </div>

                  {/* Operating Amps */}
                  <div
                    style={{ display: "block", marginTop: "15px", textAlign: "center" }}
                  >
                    <label>Operating Amps:</label>
                    <input
                      type="number"
                      value={operatingM}
                      onChange={(e) => setOperatingM(e.target.value)}
                      style={{
                        ...styles.input,
                        marginTop: "8px",
                        textAlign: "center",
                      }}
                      placeholder="Enter operating Amps"
                    />
                  </div>

                  {/* Clear Button */}
                  <div style={{ textAlign: "center", marginTop: "10px" }}>
                    <button
                      onClick={() => {
                        setOperatingM("");
                        setKva("");
                        setCalcDetails(null);
                      }}
                      style={{
                        padding: "10px 20px",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        cursor: "pointer",
                        backgroundColor: "#ffebee",
                        color: "#d32f2f",
                        fontWeight: "bold",
                      }}
                    >
                      🧹 Clear All
                    </button>
                  </div>
                </div>

                {/* Result Section */}
                {calcDetails && (
                  <div style={{ ...styles.card, marginTop: "20px" }}>
                    <p><b>🔹 Genset Rating:</b> {calcDetails.kva} kVA</p>
                    <p><b>🔹 Operating Amps:</b> {calcDetails.operatingM} A</p>
                    <p><b>🔹 Estimated Energy:</b> {calcDetails.requiredEnergy.toFixed(1)} kWh/day</p>
                    <p><b>🔹 Recommended Inverter Capacity:</b> {calcDetails.inverterCapacity} kW</p>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <p>Please enter your electricity demand per day (in kWh):</p>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              style={styles.input}
              placeholder="Enter electricity (kWh)"
            />

            <h3>OR</h3>

            <div style={styles.card}>
              <h4>📝 Custom Appliance List</h4>
              <p>You can type or paste your appliances here.</p>

              <textarea
                style={{
                  width: "90%",
                  height: "120px",
                  padding: "10px",
                  fontSize: "14px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  resize: "vertical",
                }}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
              />

              <div style={{display: "flex", justifyContent: "center", gap:"10px"}}>
              {/* Copy Button */}
                <button
                  style={styles.helpButton}
                  onClick={() => {
                    navigator.clipboard.writeText(customText);
                    setCopyMessage("✅ Custom list copied! Paste it into ChatGPT to calculate.");
                    setTimeout(() => setCopyMessage(""), 3000); // Auto hide after 3s
                  }}
                >
                  📋 Copy Text
                </button>

                {/* NEW Ask ChatGPT Button */}
                <button
                  style={{ ...styles.helpButton, marginLeft: "10px", backgroundColor: "#10a37f" }}
                  onClick={() => {
                    const chatGPTUrl = `https://chat.openai.com/?q=${encodeURIComponent(customText)}`;
                    window.open(chatGPTUrl, "_blank");
                  }}
                >
                  🤖 Ask ChatGPT
                </button>
              </div>

              {copyMessage && (
                <p style={{ color: "green", fontSize: "14px", marginTop: "8px" }}>
                  {copyMessage}
                </p>
              )}
            </div>
          </>
        )}

          {/* Main content (Confirm + Error Message) */}
          <div style={{ textAlign: "center"}}>
            {/* Show error message */}
            {errorMessage && (
              <p style={{ color: "red"}}>{errorMessage}</p>
            )}

            <button
              style={styles.modeButton}
              onClick={() => {
                if (mode === "Hybrid" || mode === "Standby") {
                  if (!phase) {
                    setErrorMessage("⚠️ Please select a genset phase.");
                    return;
                  }
                  if (!operatingM) {
                    setErrorMessage("⚠️ Please enter operating Amps.");
                    return;
                  }
                  if (!kva) {
                    setErrorMessage("⚠️ Please enter the genset rating (kVA).");
                    return;
                  }
                  // ✅ Guardrails
                   if (Number(operatingM) <= 0) {
                    setErrorMessage("⚠️ Operating Amps cannot be negative.");
                    return;
                  }
                  if (Number(kva) <= 0) {
                    setErrorMessage("⚠️ Genset rating (kVA) must be greater than 0.");
                    return;
                  }
                } else {
                  if (!value) {
                    setErrorMessage("⚠️ Please enter your electricity usage (kWh).");
                    return;
                  }
                }

                // If everything is filled, clear error and confirm
                setErrorMessage("");
                setConfirmed(true);

                // ✅ Delay scroll by 1s (after Step 3 renders)
                setTimeout(() => {
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }, 500);
              }}
            >
              Confirm
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Step 3: Show result summary
  return (
    <div style={styles.container}>
      <motion.div
        key="step3"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.4 }}
      >
        
        {/* Back button at top left */}
        <div style={{ position: "relative", minHeight: "30px" }}>
          <button
            style={{
                position: "absolute",
                // top: "1px",
                left: "10px",
                padding: "10px 20px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                cursor: "pointer",
                background: "#f5f5f5",
              }}
            onClick={() => {
              setConfirmed(false); // go back to Step 2
            }}
          >
            ← Back
          </button>
        </div>

        <h2>🌞 System Summary</h2>
        <p>
          You selected:{" "}
          <b>
            {mode === "Hybrid"
              ? <>Solar + Battery + <br /> Generator (Hybrid Mode)</>
              : mode === "Standby"
              ? <>Solar + Battery + <br /> Generator (Standby Mode)</>
              : "Solar + Battery (Off-Grid)"}
          </b>
        </p>

        {mode === "Hybrid" || mode === "Standby"? (
          <>
            {/* Diesel saving slider */}
            <label style={{ display: "block", margin: "20px 0" }}>
              Diesel Saving: <b>{dieselSaving}%</b>
              <input
                type="range"
                min="0"
                max="100"
                value={dieselSaving}
                onChange={(e) => setDieselSaving(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </label>

            {/* Calculation */}
            {(() => {
              // --- Constants ---
              const pf = 0.85;
              const sqrt3 = 1.732;
              const singleV = 230;
              const threeV = 400;
              const solarCost = 1800;
              const batteryCost = 660;
              const inverterCost = 4000;
              const installCost = 1000;
              const dieselCost = 0.9;
              const tax = 0.24;
              const panelCapacity = 0.64;
              const peakSunHour = 3.5;
              const days = 30;

              // --- Inputs ---
              const selectedPhase = phase === "single" ? "Single Phase" : "Three Phase";
              const operatingAmp = operatingM || 140;
              const kFactor = selectedPhase === "Single Phase" ? 0.1955 : 0.5889;

              // --- Calculations ---
              const singlePhaseCalc = (singleV * pf) / 1000;
              const threePhaseCalc = (threeV * pf * sqrt3) / 1000;
              const required_kWh = operatingAmp * (dieselSaving / 100) * kFactor;

              // 🔹 Round up solar normally, but battery to nearest 5
              const solarNeeded = Math.ceil((required_kWh / panelCapacity) / 0.8);
              const batteryRaw = (required_kWh / 2) * 2;
              const batteryNeeded = Math.ceil(batteryRaw / 5) * 5; // Ceiling to nearest 5

              // 🔹 Inverter capacity selection (nearest to required energy)
              const inverterOptions = [20, 30, 50];
              const inverterCapacity = inverterOptions.reduce((prev, curr) =>
                Math.abs(curr - required_kWh) < Math.abs(prev - required_kWh) ? curr : prev
              );

              const solarRM =
                Math.round(((solarNeeded * panelCapacity) * solarCost) / 100) * 100;
              const batteryRM = batteryNeeded * batteryCost;
              const totalRM = solarRM + batteryRM + inverterCost + installCost;
              const saving =
                solarNeeded * panelCapacity * peakSunHour * days * dieselCost;
              const netCost = totalRM * (1 - tax);
              const annualSaving = saving * 12;
              const roiYears = annualSaving > 0 ? netCost / annualSaving : NaN;

              // --- Styles ---
              const section = {
                background: "#ffffff",
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "16px 20px",
                marginBottom: "14px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                textAlign: "left",
              };
              const title = {
                fontSize: "16px",
                fontWeight: "bold",
                color: "#1565c0",
                marginBottom: "10px",
                borderBottom: "2px solid #e3f2fd",
                paddingBottom: "4px",
              };
              const line = { margin: "4px 0" };

              // --- JSX ---
              return (
                <div
                  style={{
                    background: "#f9fbfd",
                    borderRadius: "14px",
                    padding: "20px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 20px 0",
                      color: "#1e88e5",
                      borderBottom: "2px solid #e3f2fd",
                      paddingBottom: "6px",
                      textAlign: "left",
                    }}
                  >
                    📘 Calculation Summary ({selectedPhase})
                  </h3>

                  {/* --- Section 1: Phase Calculations --- */}
                  <div style={section}>
                    <div style={title}>🔹 Phase Conversion</div>
                    <div style={line}>Single Phase: 230 × 0.85 / 1000 = <b>{singlePhaseCalc.toFixed(4)} kW</b></div>
                    <div style={line}>Three Phase: 400 × 0.85 × 1.732 / 1000 = <b>{threePhaseCalc.toFixed(4)} kW</b></div>
                  </div>

                  {/* --- Section 2: Energy Needs --- */}
                  <div style={section}>
                    <div style={title}>⚡ Energy Requirement</div>
                    <div style={line}>Required kWh = {operatingAmp} × ({dieselSaving}% ÷ 100) × {kFactor} = <b>{required_kWh.toFixed(3)} kWh</b></div>
                    <div style={line}>Solar Panel Needed = {required_kWh.toFixed(3)} ÷ 0.64 ÷ 0.8 = <b>{solarNeeded} pcs</b></div>
                    <div style={line}>Battery Needed = ({required_kWh.toFixed(2)} ÷ 2) × 2 = <b>{batteryNeeded} kWh</b></div>
                    <div style={line}>Inverter Capacity = <b>{inverterCapacity} kW</b></div>
                  </div>

                  {/* --- Section 3: Cost Breakdown --- */}
                  <div style={section}>
                    <div style={title}>💰 Cost Breakdown</div>
                    <div style={line}>Solar Cost: RM {solarRM.toLocaleString()}</div>
                    <div style={line}>Battery Cost: RM {batteryRM.toLocaleString()}</div>
                    <div style={line}>Inverter + Install: RM {(inverterCost + installCost).toLocaleString()}</div>
                    <div style={{ ...line, fontWeight: "bold", marginTop: "8px" }}>
                      Total System Cost = RM {totalRM.toLocaleString()}
                    </div>
                  </div>

                  {/* --- Section 4: Saving & ROI --- */}
                  <div style={section}>
                    <div style={title}>💡 Saving & ROI</div>
                    <div style={line}>
                      Monthly Saving = ({solarNeeded} × 0.64 × 3.5 × 30 × 0.9) = <b>RM {saving.toLocaleString()}</b>
                    </div>
                    <div style={line}>
                      ROI = (RM{totalRM.toLocaleString()} × {1 - tax}) ÷ (RM{saving.toFixed(2)} × 12) ={" "}
                      <b>{isFinite(roiYears) ? roiYears.toFixed(2) : "-"} Years</b>
                    </div>
                  </div>
                </div>
              );
            })()}
          </>
        ) : (
          <>
            {/* --- Variable Declarations --- */}
            {(() => {
              // --- Styles ---
              const card = {
                background: "#e6f0ff",
                borderRadius: "12px",
                padding: "20px",
                marginTop: "20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              };

              const sectionCard = {
                background: "#ffffff",
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "12px 16px",
                marginBottom: "14px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              };

              const sectionHeader = {
                fontSize: "16px",
                fontWeight: "bold",
                color: "#1565c0",
                marginBottom: "8px",
                borderBottom: "2px solid #e3f2fd",
                paddingBottom: "4px",
              };

              // --- Constants ---
              const solarCost = 1800;
              const batteryCost = 660;
              const inverterCost = 4000;
              const installCost = 1000;
              const dieselCost = 0.9;
              const tax = 0.24;
              const panelCapacity = 0.64;
              const peakSunHour = 3.5;
              const days = 30;

              // --- Calculations ---
              const required_kWh = value;

              // 🔹 Panel calculation (/3.5 added)
              const solarNeeded = Math.ceil((required_kWh / panelCapacity / 0.8 / 3.5));

              // 🔹 Battery storage (/0.9 added, no /2)
              const batteryRaw = required_kWh / 0.9;
              const batteryNeeded = Math.ceil(batteryRaw / 5) * 5; // round up to nearest 5

              // 🔹 Inverter capacity (nearest to 20, 30, 50)
              const inverterOptions = [20, 30, 50];
              const inverterCapacity = inverterOptions.reduce((prev, curr) =>
                Math.abs(curr - required_kWh) < Math.abs(prev - required_kWh) ? curr : prev
              );

              const solarRM = Math.round(((required_kWh * panelCapacity) * solarCost) / 100) * 100;
              const batteryRM = batteryNeeded * batteryCost;
              const totalRM = solarRM + batteryRM + inverterCost + installCost;
              const saving = (solarNeeded * panelCapacity) * peakSunHour * days * dieselCost;
              const netCost = totalRM * (1 - tax);
              const annualSaving = saving * 12;
              const roiYears = annualSaving > 0 ? netCost / annualSaving : NaN;

              return (
                <div
                  style={{
                    ...card,
                    background: "#f9fbfd",
                    padding: "18px",
                    borderRadius: "14px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    textAlign: "left",
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  {/* --- Header --- */}
                  <h3
                    style={{
                      margin: "0",
                      color: "#1e88e5",
                      borderBottom: "2px solid #e3f2fd",
                      paddingBottom: "6px",
                    }}
                  >
                    ☀️ Off-Grid Solar System Summary
                  </h3>

                  {/* --- Section 1: Input Parameters --- */}
                  <div style={sectionCard}>
                    <h4 style={sectionHeader}>📥 Input Parameters</h4>
                    <p>• Electricity Usage: <b>{required_kWh} kWh/day</b></p>
                  </div>

                  {/* --- Section 2: System Constants --- */}
                  <div style={sectionCard}>
                    <h4 style={sectionHeader}>⚙️ System Constants</h4>
                    <p>• Peak Sun Hour: <b>{peakSunHour} h/day</b></p>
                    <p>• Solar Panel Wattage: <b>{panelCapacity} W</b></p>
                  </div>

                  {/* --- Section 3: Energy Calculations --- */}
                  <div style={sectionCard}>
                    <h4 style={sectionHeader}>🧮 Energy Calculations</h4>
                    <p>
                      • Required Energy = <b>{required_kWh} kWh/day</b>
                    </p>
                    <p>
                      • Panels Needed = {required_kWh} ÷ {panelCapacity} ÷ 0.8 ÷ 3.5 = <b>{solarNeeded} pcs</b>
                    </p>
                    <p>
                      • Battery Storage = {required_kWh} ÷ 0.9 = <b>{batteryNeeded} kWh</b>
                    </p>
                    <p>
                      • Inverter Capacity = <b>{inverterCapacity} kWh</b>
                    </p>
                  </div>

                  {/* --- Section 4: Cost Breakdown --- */}
                  <div style={sectionCard}>
                    <h4 style={sectionHeader}>💰 Cost Breakdown</h4>
                    <p>• Solar Panel Cost: <b>RM {solarRM.toLocaleString()}</b></p>
                    <p>• Battery Cost: <b>RM {batteryRM.toLocaleString()}</b></p>
                    <p>• Inverter + Installation: <b>RM {(inverterCost + installCost).toLocaleString()}</b></p>
                    <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "10px 0" }} />
                    <p><b>Total System Cost:</b> RM {totalRM.toLocaleString()}</p>
                  </div>

                  {/* --- Section 5: Saving & ROI --- */}
                  <div style={sectionCard}>
                    <h4 style={sectionHeader}>💡 Saving & ROI</h4>
                    <p>
                      • Monthly Saving = ({solarNeeded} × 0.64 × {peakSunHour} × 30 × 0.9)  
                      = <b>RM {saving.toLocaleString()}</b>
                    </p>
                    <p>
                      • ROI = (RM{totalRM.toLocaleString()} × {1 - tax}) ÷ (RM{saving.toFixed(2)} × 12)  
                      = <b>{isFinite(roiYears) ? roiYears.toFixed(2) : "-"} Years</b>
                    </p>
                  </div>
                </div>
              );
            })()}
          </>
        )}

        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center",
          gap: "15px", 
          marginTop: "30px", 
          width: "100%"
          }}
          >
          {/* <button
            style={{
              backgroundColor: "green",
              color: "white",
              padding: "14px 24px",
              fontSize: "16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              width: "250px",
            }}
            onClick={() => {
              const doc = new jsPDF();
              doc.setFontSize(20);
              doc.text("Hybrid Off-Grid System Report", 14, 20);

              let y = 35;
              doc.setFontSize(12);

              // --- Section 1: Phase Conversion ---
              doc.text("🔹 Phase Conversion", 14, y);
              y += 8;
              doc.text(`Single Phase: 230 × 0.85 / 1000 = ${singlePhaseCalc.toFixed(4)} kW`, 14, y);
              y += 8;
              doc.text(`Three Phase: 400 × 0.85 × 1.732 / 1000 = ${threePhaseCalc.toFixed(4)} kW`, 14, y);
              y += 12;

              // --- Section 2: Energy Requirement ---
              doc.text("⚡ Energy Requirement", 14, y);
              y += 8;
              doc.text(
                `Required kWh: ${operatingAmp} × (${dieselSaving}% ÷ 100) × ${kFactor} = ${required_kWh.toFixed(3)} kWh`,
                14,
                y
              );
              y += 8;
              doc.text(
                `Solar Panel Needed: ${required_kWh.toFixed(3)} ÷ 0.64 ÷ 0.8 = ${solarNeeded} pcs`,
                14,
                y
              );
              y += 8;
              doc.text(
                `Battery Needed: (${required_kWh.toFixed(2)} ÷ 2) × 2 = ${batteryNeeded} kWh`,
                14,
                y
              );
              y += 12;

              // --- Section 3: Cost Breakdown ---
              doc.text("💰 Cost Breakdown", 14, y);
              y += 8;
              doc.text(`Solar Cost: RM ${solarRM.toLocaleString()}`, 14, y);
              y += 8;
              doc.text(`Battery Cost: RM ${batteryRM.toLocaleString()}`, 14, y);
              y += 8;
              doc.text(`Inverter + Install: RM ${(inverterCost + installCost).toLocaleString()}`, 14, y);
              y += 8;
              doc.text(`Total System Cost: RM ${totalRM.toLocaleString()}`, 14, y);
              y += 12;

              // --- Section 4: Saving & ROI ---
              doc.text("💡 Saving & ROI", 14, y);
              y += 8;
              doc.text(
                `Monthly Saving: (${solarNeeded} × 0.64 × 3.5 × 30 × 0.9) = RM ${saving.toLocaleString()}`,
                14,
                y
              );
              y += 8;
              doc.text(
                `ROI: (RM${totalRM.toLocaleString()} × ${1 - tax}) ÷ (RM${saving.toFixed(2)} × 12) = ${
                  isFinite(roiYears) ? roiYears.toFixed(2) : "-"
                } Years`,
                14,
                y
              );

              // Save file
              doc.save("Hybrid_OffGrid_Report.pdf");
            }}
          >
            📄 Export to PDF
          </button> */}

          <button
            style={{
              backgroundColor: "red",
              color: "white",
              padding: "14px 24px",
              fontSize: "16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              width: "250px",
            }}
            onClick={() => {
              setMode("");
              setPhase("");
              setValue("");
              setOperatingM("");
              setKva("");
              setCalcDetails(null);
              setPhase("");
              setConfirmed(false);
              setOperatingHours(8);
              setDieselSaving(50);
              setGensetLiters("")
            }}
          >
            ← Start Over
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const styles = {
  container: { 
    width: 340, 
    margin: "50px auto", 
    textAlign: "center" 
  },

  modeButton: {
    margin: "10px",
    padding: "10px 25px",
    fontSize: 16,
    cursor: "pointer",
    borderRadius: 8,
    background: "#2196F3",
    color: "white",
    border: "none",
  },

  helpButton: {
    margin: "10px 0",
    padding: "8px 15px",
    fontSize: 14,
    cursor: "pointer",
    borderRadius: 6,
    background: "#4CAF50",
    color: "white",
    border: "none",
  },

  backButton: {
    marginTop: 15,
    marginLeft: 10,
    padding: "10px 20px",
    fontSize: 16,
    background: "#777",
    color: "white",
    cursor: "pointer",
    border: "none",
    borderRadius: 5,
  },

  card: {
    border: "1px solid #ddd",
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
    textAlign: "left",
    background: "#fafafa",
  },

  input: {
    padding: "8px",
    fontSize: 16,
    width: "80%",
    marginBottom: "10px",
    borderRadius: 5,
    border: "1px solid #ccc",
    textAlign: "center",
  },

  guideline: {
    background: "#f9f9f9",
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: "10px",
    marginBottom: "15px",
    fontSize: "14px",
    textAlign: "left",
  },

  centerCard: {
    marginTop: "15px",
    padding: "15px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },

  // 🆕 Added clean card layout styles for the calculation summary
  sectionCard: {
    background: "#fff",
    borderRadius: "10px",
    padding: "12px 16px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    marginBottom: "12px",
  },

  sectionHeader: {
    marginBottom: "10px",
    color: "#1565c0",
    borderBottom: "1px solid #e3f2fd",
    paddingBottom: "4px",
    fontWeight: "600",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.95rem",
  },

  label: {
    fontWeight: 500,
  },

  value: {
    fontWeight: 600,
    color: "#1b5e20",
  },
};

export default App;