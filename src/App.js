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
  const [hasGenset, setHasGenset] = useState(null); // for backup genset
  const [errorMessage, setErrorMessage] = useState("");  

  // Custom Appliance
  const [customText, setCustomText] = useState(
    "1. Air Conditioner – 1.5 HP – 1 unit – 8 hours/day\n2. Refrigerator – Medium – 1 unit – 24 hours/day\n\nPlease calculate the kWh/day for these appliances"
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

  // step 3: off-grid

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
                setHasGenset(null);
                setErrorMessage("")
                setOperatingHours(8)
                setGensetLiters("")
                setCustomText(
                  "1. Air Conditioner – 1.5 HP – 1 unit – 8 hours/day\n2. Refrigerator – Medium – 1 unit – 24 hours/day\n\nPlease calculate the kWh/day for these appliances"
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
              <div style={{ marginTop:"10px"}}>
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
                <p style={{ textAlign:"center", marginTop: "15px" }}><strong>Please enter your genset details</strong>:</p>
                
                <div style={styles.card}>
                  {/* NEW: Genset Liters Input */}
                  <div style={{ textAlign:"center", marginTop: "15px" }}>
                    <label>
                      Genset Fuel Capacity (Liters):
                    </label>
                    <input
                      type="number"
                      value={gensetLiters}
                      onChange={(e) => setGensetLiters(e.target.value)}
                      style={{
                        ...styles.input, 
                        marginTop:"8px",
                        textAlign:"center",}}
                      placeholder="Enter genset liters"
                    />
                  </div>

                  {/* Operating Hours Slider */}
                  <div style={{ marginTop: "15px" }}>
                    <label>
                      Operating Hours: <b>{operatingHours}h</b>
                      <input
                        type="range"
                        min="1"
                        max="24"
                        value={operatingHours}
                        onChange={(e) => setOperatingHours(Number(e.target.value))}
                        style={{ width: "100%" }}
                      />
                    </label>
                  </div>
                  
                  {/* Auto Calculate Button */}
                  <div style={{ textAlign: "center", marginTop: "5px" }}>
                    <button
                      onClick={() => {
                        if (!gensetLiters) return;

                        // --- Assumptions ---
                        // 0.25 L/kWh diesel consumption
                        // 8 hours runtime
                        // PF = 0.85
                        const kWh = gensetLiters / 0.25; 
                        const estimatedKW = kWh / operatingHours; // assume 8h runtime
                        const estimatedKVA = estimatedKW / 0.85;

                        let Imax = 0;
                        if (phase === "three") {
                          // Three-phase @ 400V
                          Imax = (1000 * estimatedKVA) / (Math.sqrt(3) * 400);
                        } else {
                          // Single-phase @ 230V
                          Imax = (1000 * estimatedKVA) / 230;
                        }

                        const I50 = Imax * 0.5; // assume min 50% load

                        // Update states
                        setOperatingM(Math.round(I50));
                        setKva(Math.round(estimatedKVA)); // convert to kVA
                      
                      // Save calculation breakdown
                      setCalcDetails({
                        kWh: kWh.toFixed(2),
                        estimatedKW: estimatedKW.toFixed(2),
                        estimatedKVA: estimatedKVA.toFixed(2),
                        Imax: Imax.toFixed(2),
                        I50: I50.toFixed(2),
                        defaultHours,
                      });

                      // Show confirmation text
                      setShowEstimateMsg(true);

                      // Hide it after 3 seconds
                      setTimeout(() => setShowEstimateMsg(false), 2500);
                      }}
                      style={{
                        padding: "10px 20px",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        cursor: "pointer",
                        backgroundColor: "#e8f5e9",
                        color: "#2e7d32",
                        fontWeight: "bold",
                        marginTop: "10px",
                      }}
                    >
                      🔍 Estimate Amps from Liters
                    </button>

                    {/* Confirmation Text */}
                    {showEstimateMsg && (
                      <p style={{ marginTop: "10px", color: "#2e7d32", fontWeight: "bold" }}>
                        ✅ Estimated values have been filled in!
                      </p>
                    )}
                  </div>

                  {/* Dropdown for Calculation Details */}
                  {calcDetails && (
                    <details style={{ marginTop: "15px", textAlign: "left" }}>
                      <summary style={{ cursor: "pointer", fontWeight: "bold", color: "#007BFF" }}>
                        📊 Show Calculation Details
                      </summary>
                      <div style={{ marginTop: "10px", paddingLeft: "15px", color: "#333" }}>
                        <p>
                          🔹 <b>Fuel → Energy:</b><br />
                          Formula: <code>Liters ÷ 0.25</code><br />
                          Result: <b>{gensetLiters} ÷ 0.25 = {calcDetails.kWh} kWh</b>
                        </p>

                        <p>
                          🔹 <b>Energy → Power (kW):</b><br />
                          Formula: <code>kWh ÷ Operating Hours (Assume 8h)</code><br />
                          Result: <b>{calcDetails.kWh} ÷ {calcDetails.defaultHours} = {calcDetails.estimatedKW} kW</b>
                        </p>

                        <p>
                          🔹 <b>Power → Apparent Power (kVA):</b><br />
                          Formula: <code>kW ÷ PF (0.85)</code><br />
                          Result: <b>{calcDetails.estimatedKW} ÷ 0.85 = {calcDetails.estimatedKVA} kVA</b>
                        </p>

                        <p>
                          🔹 <b>Max Current (Imax):</b><br />
                          Formula:{" "}
                          {phase === "three" ? (
                            <code>(1000 * kVA) / (√3 * 400)</code>
                          ) : (
                            <code>(1000 * kVA) / 230</code>
                          )}<br />
                          Result: <b>{calcDetails.Imax} A</b>
                        </p>

                        <p>
                          🔹 <b>Operating Amps (50% Load):</b><br />
                          Formula: <code>Imax × 0.5</code><br />
                          Result: <b>{calcDetails.Imax} × 0.5 = {calcDetails.I50} A</b>
                        </p>

                        <p style={{ color: "#2e7d32", fontWeight: "bold" }}>
                          ✅ System assumes 50% load condition for real-world operating range.
                        </p>
                      </div>
                    </details>
                  )}
                </div>

                <h3>OR</h3>

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
                        <p style={{ fontSize: "14px", color: "#555", marginBottom: "15px" }}>
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
                            style={{ ...styles.modeButton, backgroundColor: "#4caf50", minwidth:"150px", }}
                            onClick={() => {
                              setKva(25);
                              setOperatingM(18);
                            }}
                          >
                            Small Usage <br />
                            <span style={{ fontSize: "12px"}}>(Shops / Small Offices)
                            </span>
                          </button>

                          <button
                            style={{ ...styles.modeButton, backgroundColor: "#2196f3", minWidth:"150px", }}
                            onClick={() => {
                              setKva(80);
                              setOperatingM(60);
                            }}
                          >
                            Medium Usage <br />
                            <span style={{ fontSize: "12px"}}>(Restaurant / School / Factory Section)</span>
                          </button>

                          <button
                            style={{ ...styles.modeButton, backgroundColor: "#f44336", minWidth: "150px", }}
                            onClick={() => {
                              setKva(200);
                              setOperatingM(150);
                            }}
                          >
                            High Usage <br />
                            <span style={{ fontSize: "12px" }}>(Large Factory / Hotel / Hospital)</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Operating Amps */}
                  <div style={{ display: "block", marginTop: "15px", textAlign:"center" }}>
                    <label>
                      Operating Amps:
                    </label>
                    <input
                      type="number"
                      value={operatingM}
                      onChange={(e) => setOperatingM(e.target.value)}
                      style={{
                          ...styles.input, 
                          marginTop:"8px",
                          textAlign:"center",}}
                      placeholder="Enter operating Amps"
                    />
                  </div>

                  {/* kVA */}
                  <div style={{ display: "block", marginTop: "15px", textAlign:"center" }}>
                    <label>
                      Genset Rating (kVA):
                    </label>
                    <input
                      type="number"
                      value={kva}
                      onChange={(e) => setKva(e.target.value)}
                      style={{
                            ...styles.input, 
                            marginTop:"8px",
                            textAlign:"center",}}
                      placeholder="Enter genset kVA"
                    />
                  </div>  

                  {/* Clear Button */}
                  <div style={{ textAlign: "center", marginTop: "20px" }}>
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
            const solarNeeded = Math.ceil(required_kWh / panelCapacity);
            const batteryRaw = (required_kWh / 2) * 2;
            const batteryNeeded = Math.ceil(batteryRaw / 5) * 5; // Ceiling to nearest 5

            const solarRM = (solarNeeded * panelCapacity) * solarCost;
            const batteryRM = batteryNeeded * batteryCost;
            const totalRM = solarRM + batteryRM + inverterCost + installCost;
            const saving = (solarNeeded * panelCapacity) * peakSunHour * days * dieselCost;
            const netCost = totalRM * (1 - tax);      // apply tax to total
            const annualSaving = saving * 12;         // convert monthly saving -> annual
            const roiYears = annualSaving > 0 ? netCost / annualSaving : NaN;

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

            const table = {
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px",
            };

            const tdStyle = {
              padding: "6px 4px",
              borderBottom: "1px solid #eee",
            };

            const label = { color: "#003366" };
            const value = { fontWeight: "bold", color: "#000" };

            // --- JSX ---
            return (
              <div
                style={{
                  ...card,
                  background: "#f9fbfd",
                  padding: "18px",
                  borderRadius: "14px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
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
                  📘 Calculation Summary ({selectedPhase})
                </h3>

                {/* --- Section 1: Phase Calculations --- */}
                <div style={sectionCard}>
                  <h4 style={sectionHeader}>🔹 Phase Conversion</h4>
                  <table style={table}>
                    <tbody>
                      <tr>
                        <td style={tdStyle}>Single Phase</td>
                        <td style={tdStyle}>230 × 0.85 / 1000</td>
                        <td style={tdStyle}>= {singlePhaseCalc.toFixed(4)} kW</td>
                      </tr>
                      <tr>
                        <td style={tdStyle}>Three Phase</td>
                        <td style={tdStyle}>400 × 0.85 × 1.732 / 1000</td>
                        <td style={tdStyle}>= {threePhaseCalc.toFixed(4)} kW</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* --- Section 2: Energy Needs --- */}
                <div style={sectionCard}>
                  <h4 style={sectionHeader}>⚡ Energy Requirement</h4>
                  <table style={table}>
                    <tbody>
                      <tr>
                        <td style={tdStyle}>Required kWh</td>
                        <td style={tdStyle}>
                          {operatingAmp} × ({dieselSaving}% ÷ 100) × {kFactor}
                        </td>
                        <td style={tdStyle}>= {required_kWh.toFixed(3)} kWh</td>
                      </tr>
                      <tr>
                        <td style={tdStyle}>Solar Panel Needed</td>
                        <td style={tdStyle}>{required_kWh.toFixed(3)} ÷ 0.64</td>
                        <td style={tdStyle}>= {solarNeeded} pcs</td>
                      </tr>
                      <tr>
                        <td style={tdStyle}>Battery Needed</td>
                        <td style={tdStyle}>
                          ({required_kWh.toFixed(2)} ÷ 2) × 2
                        </td>
                        <td style={tdStyle}>= {batteryNeeded} kWh</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* --- Section 3: Cost Breakdown --- */}
                <div style={sectionCard}>
                  <h4 style={sectionHeader}>💰 Cost Breakdown</h4>
                  <table style={table}>
                    <tbody>
                      <tr>
                        <td style={tdStyle}>Solar Cost</td>
                        <td style={tdStyle} colSpan={2}>
                          RM {solarRM.toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td style={tdStyle}>Battery Cost</td>
                        <td style={tdStyle} colSpan={2}>
                          RM {batteryRM.toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td style={tdStyle}>Inverter + Install</td>
                        <td style={tdStyle} colSpan={2}>
                          RM {(inverterCost + installCost).toLocaleString()}
                        </td>
                      </tr>
                      <tr
                        style={{
                          ...tdStyle,
                          borderTop: "1px solid #ccc",
                          fontWeight: "bold",
                        }}
                      >
                        <td>Total System Cost</td>
                        <td colSpan={2}>RM {totalRM.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* --- Section 4: Saving & ROI --- */}
                <div style={sectionCard}>
                  <h4 style={sectionHeader}>💡 Saving & ROI</h4>
                  <table style={table}>
                    <tbody>
                      <tr>
                        <td style={tdStyle}>Monthly Saving</td>
                        <td style={tdStyle}>
                          ({solarNeeded} × 0.64 × 3.5 × 30 × 0.9)
                        </td>
                        <td style={tdStyle}>= RM {saving.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td style={tdStyle}>ROI</td>
                        <td style={tdStyle}>
                          (RM{totalRM.toLocaleString()} × {1 - tax}) ÷ (RM
                          {saving.toFixed(2)} × 12)
                        </td>
                        <td style={tdStyle}>
                          = <b>{isFinite(roiYears) ? roiYears.toFixed(2) : "-"} Years</b>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
          </>
        ) : (
          <>
            {/* Off-Grid */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                gap: "20px",
                marginTop: "20px",
              }}
            >
              {/* Input Parameters */}
              <div style={styles.card}>
                <h4>📥 Input Parameters</h4>
                <p>Electricity Usage: <b>{value} kWh/day</b></p>
              </div>

              {/* System Constants */}
              <div style={styles.card}>
                <h4>⚙️ System Constants</h4>
                <p>Peak Sun Hour = <b>3.42 h/day</b></p>
                <p>Solar Panel Wattage = <b>640 W</b></p>
                <p>Autonomy = <b>3 Days</b></p>
              </div>

              {/* Calculation */}
              <div style={styles.card}>
                <h4>🧮 Calculation</h4>
                <p>Required kWh = <b>{value}</b> kWh/day</p>

                <p>
                  Panels Needed ≈ <br />
                  <b>({value} × 1.3) ÷ ((640 ÷ 1000) × 3.42)</b> <br />
                  ≈ <b>{Math.ceil((Number(value) * 1.3) / ((640 / 1000) * 3.42))}</b> panels
                </p>

                <p>
                  Battery Storage Needed ≈{" "}
                  <b>
                    ({value} × 3) ≈{" "} 
                    {Math.ceil((Number(value) * 3))} kWh
                  </b>
                </p>
              </div>

              {/* System Requirement */}
              <div style={styles.card}>
                <h4>✅ System Requirement</h4>
                <p>
                  Total Solar Panels:{" "}
                  <b>{Math.ceil((Number(value) * 1.3) / ((640 / 1000) * 3.42))}</b>
                </p>
                <p>
                  Required Battery Storage:{" "}
                  <b>
                    {Number(value) * 3} kWh
                  </b>
                </p>
                <p style={{ marginTop: "10px", fontStyle: "italic", color: "#555" }}>
                  ⚠️ Batteries provide autonomy for <b>3 days</b>.
                </p>
              </div>
            </div>
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
          <button
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

              // --- Constants ---
              const peakSunHour = 3.42;
              const panelWatt = 640;
              const pf = 0.85;

              let totalPanels = 0;
              let required_kWh = 0;
              let genset_kWh = 0;
              let effectiveAmp = 0;

              // --- If genset fuel capacity is provided, assume 50% load ---
              if (gensetLiters) {
                effectiveAmp = operatingM * 0.5;
              } else {
                effectiveAmp = operatingM;
              }

              // --- Energy Calculations ---
              if (mode === "Hybrid" || mode === "Standby") {
                genset_kWh = effectiveAmp * operatingHours; // amps × hours (rough estimation)
                required_kWh = genset_kWh * (dieselSaving / 100); // solar offset target
                totalPanels = Math.ceil(
                  (required_kWh * 1.3) / ((panelWatt / 1000) * peakSunHour)
                );
              } else {
                required_kWh = Number(value || 0); // off-grid user input
                totalPanels = Math.ceil(
                  (required_kWh * 1.3) / ((panelWatt / 1000) * peakSunHour)
                );
              }

              const requiredBatteryStorageKwh =
                mode === "Hybrid" || mode === "Standby"
                  ? required_kWh
                  : required_kWh * 3;

              // --- Title ---
              doc.setFontSize(20);
              doc.setTextColor(40, 90, 140);
              doc.text("System Sizing Report", 14, 20);

              // --- Section: Input Parameters ---
              doc.setFillColor(230, 240, 255);
              doc.rect(10, 30, 190, 10, "F");
              doc.setTextColor(0);
              doc.setFontSize(14);
              doc.text("Input Parameters", 14, 37);

              doc.setFontSize(12);
              if (mode === "Hybrid" || mode === "Standby") {
                const kvaToKw = (Number(kva) * pf).toFixed(1);
                doc.setFont("helvetica", "normal");
                doc.text(`Mode: ${mode}`, 14, 47);
                doc.text(
                  `Genset Rating: ${kva} kVA (= ${kvaToKw} kW at PF ${pf})`,
                  14,
                  55
                );
                doc.text(`Operating Hours: ${operatingHours} h/day`, 14, 63);
                doc.text(`Diesel Saving Target: ${dieselSaving}%`, 14, 71);

                if (gensetLiters) {
                  doc.text(`(Auto Applied 50% Load based on Genset Capacity)`, 14, 79);
                }
              } else {
                doc.text(`Mode: Off-Grid`, 14, 47);
                doc.text(`Daily Usage: ${value} kWh/day`, 14, 55);
                doc.text(
                  `Generator Mode: ${
                    hasGenset === "hybrid"
                      ? "Hybrid Mode"
                      : hasGenset === "standby"
                      ? "Standby Mode"
                      : "Not Applicable"
                  }`,
                  14,
                  63
                );
              }

              // --- Section: System Constants ---
              doc.setFillColor(230, 240, 255);
              doc.rect(10, 90, 190, 10, "F");
              doc.setFontSize(14);
              doc.text("System Constants", 14, 97);

              doc.setFontSize(12);
              doc.text(`Power Factor: ${pf}`, 14, 107);
              doc.text(`Peak Sun Hours: ${peakSunHour} h/day`, 14, 115);
              doc.text(`Solar Panel Size: ${panelWatt} W`, 14, 123);

              // --- Section: Full Calculations ---
              doc.setFillColor(230, 240, 255);
              doc.rect(10, 135, 190, 10, "F");
              doc.setFontSize(14);
              doc.text("Full Calculations", 14, 142);

              doc.setFontSize(11);
              if (mode === "Hybrid" || mode === "Standby") {
                doc.text(
                  `1) Estimated Genset Output = ${effectiveAmp.toFixed(1)} A × ${operatingHours} h = ${genset_kWh.toFixed(1)} kWh/day`,
                  14,
                  152
                );
                doc.text(
                  `2) Required Solar = ${genset_kWh.toFixed(1)} × (${dieselSaving}% ÷ 100) = ${required_kWh.toFixed(1)} kWh/day`,
                  14,
                  160
                );
                doc.text(
                  `3) Per Panel Output = (${panelWatt} ÷ 1000) × ${peakSunHour} = ${(panelWatt / 1000 * peakSunHour).toFixed(2)} kWh/day`,
                  14,
                  168
                );
                doc.text(
                  `4) Total Panels (with 30% reserve) = ${required_kWh.toFixed(1)} × 1.3 ÷ ${((panelWatt / 1000) * peakSunHour).toFixed(2)} = ${totalPanels}`,
                  14,
                  176
                );
                doc.text(
                  `5) Required Battery Storage = ${requiredBatteryStorageKwh.toFixed(1)} kWh/day`,
                  14,
                  184
                );

                if (gensetLiters) {
                  doc.text(`(Applied 50% load for initial genset estimation)`, 14, 192);
                }
              } else {
                doc.text(`1) Required Energy = ${required_kWh} kWh/day`, 14, 152);
                doc.text(
                  `2) Per Panel Output = (${panelWatt} ÷ 1000) × ${peakSunHour} = ${(panelWatt / 1000 * peakSunHour).toFixed(2)} kWh/day`,
                  14,
                  160
                );
                doc.text(
                  `3) Total Panels (with 30% reserve) = ${required_kWh} × 1.3 ÷ ${((panelWatt / 1000) * peakSunHour).toFixed(2)} = ${totalPanels}`,
                  14,
                  168
                );
                doc.text(
                  `4) Required Battery Storage = ${requiredBatteryStorageKwh.toFixed(1)} kWh/day`,
                  14,
                  176
                );
              }

              // --- Section: Final System Requirement ---
              doc.setFillColor(230, 240, 255);
              doc.rect(10, 202, 190, 10, "F");
              doc.setFontSize(14);
              doc.text("System Requirement", 14, 209);

              doc.setFontSize(12);
              doc.setTextColor(20, 100, 20);
              doc.text(`Solar Panels Needed: ${totalPanels}`, 14, 219);
              doc.text(
                `Battery Storage Required: ${requiredBatteryStorageKwh.toFixed(1)} kWh/day`,
                14,
                227
              );

              doc.save("system-sizing-report.pdf");
            }}
          >
            📄 Export to PDF
          </button>

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
              setHasGenset(null);
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