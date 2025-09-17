import React, { useState, useEffect } from "react";
import { FaSolarPanel, FaBatteryFull, FaTimesCircle } from "react-icons/fa";
import { GiPowerGenerator } from "react-icons/gi";
import { motion } from "framer-motion";
import jsPDF from "jspdf";

function App() {
  const [mode, setMode] = useState("");        // "Hybrid" or "Off-Grid"
  const [value, setValue] = useState("");      // Genset kWm or Electricity kWh
  const [confirmed, setConfirmed] = useState(false);

  // step 2: hybrid
  const [rangeMin, setRangeMin] = useState("");
  const [rangeMax, setRangeMax] = useState("");
  const [average, setAverage] = useState("");
  const [phase, setPhase] = useState("");
  const [operatingM, setOperatingM] = useState("");
  const [kva, setKva] = useState("");
  const [operatingHours, setOperatingHours] = useState("")
  useEffect(() => {
    if (rangeMin && rangeMax) {
      setAverage(((Number(rangeMin) + Number(rangeMax)) / 2).toFixed(1));
    }
  }, [rangeMin, rangeMax]);
  const [showPresets, setShowPresets] = useState(false);

  // step 2: off-grid
  const [applianceList, setApplianceList] = useState([]);
  const [hasGenset, setHasGenset] = useState(null); // for backup genset
  const [units, setUnits] = useState("");
  const [errorMessage, setErrorMessage] = useState("");  

  // Appliance helper states
  const [showHelper, setShowHelper] = useState(false);
  const [appliance, setAppliance] = useState("");
  const [power, setPower] = useState("");
  const [hours, setHours] = useState("");

  // Custom Appliance
  const [customText, setCustomText] = useState(
    "1. Air Conditioner – 1.5 HP – 1 unit – 8 hours/day\n2. Refrigerator – Medium – 1 unit – 24 hours/day\n\nPlease calculate the kWh/day for these appliances"
  );
  const [copyMessage, setCopyMessage] = useState("");

  // step 3: hybrid
  const [dieselSaving, setDieselSaving] = useState(50); // % saving from genset

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
              width: 220,
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
              backgroundColor: "#007BFF",
            }}
          >
            <strong>Hybrid</strong>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <FaSolarPanel size={40} />
              <FaBatteryFull size={40} />
              <GiPowerGenerator size={40} />
            </div>
          </button>

          {/* Off-Grid Button */}
          <button
            onClick={() => setMode("Off-Grid")}
            style={{
              width: 220,
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
            <strong>Off-Grid</strong>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <FaSolarPanel size={40} />
              <FaBatteryFull size={40} />
              <GiPowerGenerator size={40} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "16px", color: "red" }}>
              <FaTimesCircle /> No TNB
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
                setRangeMin("");
                setRangeMax("");
                setAverage("");
                setKva("");
                setValue("");
                setShowHelper(false);
                setAppliance("");
                setUnits("");
                setPower("");
                setHours("");
                setApplianceList([]);
                setHasGenset(null);
                setErrorMessage("")
                setOperatingHours("")
                setCustomText(
                  "1. Air Conditioner – 1.5 HP – 1 unit – 8 hours/day\n2. Refrigerator – Medium – 1 unit – 24 hours/day\n\nPlease calculate the kWh/day for these appliances"
                );
              }}
            >
              ← Back
            </button>
          </div>


        <h2>{mode} System Setup</h2>

        {mode === "Hybrid" ? (
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
                <p style={{ marginTop: "15px" }}>Please enter your genset details:</p>

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
                          display: "flex",
                          justifyContent: "center",
                          gap: "10px",
                          marginBottom: "15px",
                        }}
                      >
                        <button
                          style={{ ...styles.modeButton, backgroundColor: "#4caf50" }}
                          onClick={() => {
                            setKva(30);
                            setOperatingM(20);
                            setRangeMin(18);
                            setRangeMax(25);
                            setAverage(21.5);
                          }}
                        >
                          Small Usage
                        </button>

                        <button
                          style={{ ...styles.modeButton, backgroundColor: "#2196f3" }}
                          onClick={() => {
                            setKva(60);
                            setOperatingM(40);
                            setRangeMin(35);
                            setRangeMax(50);
                            setAverage(42.5);
                          }}
                        >
                          Medium Usage
                        </button>

                        <button
                          style={{ ...styles.modeButton, backgroundColor: "#f44336" }}
                          onClick={() => {
                            setKva(120);
                            setOperatingM(80);
                            setRangeMin(70);
                            setRangeMax(100);
                            setAverage(85);
                          }}
                        >
                          High Usage
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Operating M */}
                <label style={{ display: "block", marginTop: "15px" }}>
                  Operating M:
                </label>
                <input
                  type="number"
                  value={operatingM}
                  onChange={(e) => setOperatingM(e.target.value)}
                  style={styles.input}
                  placeholder="Enter operating M"
                />

                {/* Range Min */}
                <label style={{ display: "block", marginTop: "15px" }}>
                  Range Min (M):
                </label>
                <input
                  type="number"
                  value={rangeMin}
                  onChange={(e) => setRangeMin(e.target.value)}
                  style={styles.input}
                  placeholder="Enter minimum M"
                />

                {/* Range Max */}
                <label style={{ display: "block", marginTop: "15px" }}>
                  Range Max (M):
                </label>
                <input
                  type="number"
                  value={rangeMax}
                  onChange={(e) => setRangeMax(e.target.value)}
                  style={styles.input}
                  placeholder="Enter maximum M"
                />

                {/* Average */}
                <label style={{ display: "block", marginTop: "15px" }}>
                  Average (M):
                </label>
                <input
                  type="number"
                  value={average}
                  readOnly
                  style={{
                    ...styles.input,
                    backgroundColor: "#f5f5f5",
                    cursor: "not-allowed",
                  }}
                />

                {/* kVA */}
                <label style={{ display: "block", marginTop: "15px" }}>
                  Genset Rating (kVA):
                </label>
                <input
                  type="number"
                  value={kva}
                  onChange={(e) => setKva(e.target.value)}
                  style={styles.input}
                  placeholder="Enter genset kVA"
                />

                {/* Operating Hours */}
                <label style={{ display: "block", marginTop: "15px" }}>
                  Operating Hours per Day:
                  <input 
                    type = "number"
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(e.target.value)}
                    style={styles.input}
                    placeholder="Enter operating hours/day"
                    min="1"
                    max="24"
                    />
                </label>

                {/* Clear Button */}
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                  <button
                    onClick={() => {
                      setOperatingM("");
                      setRangeMin("");
                      setRangeMax("");
                      setAverage("");
                      setKva("");
                      setOperatingHours("");
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

            {/* Ask about genset backup */}
            <div style={styles.card}>
              <h4>Backup Genset</h4>
              <p>What is your genset configuration?</p>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px"}}>

                <label>
                  <input
                    type="radio"
                    name="backup"
                    value="hybrid"
                    checked={hasGenset === "hybrid"}
                    onChange={() => setHasGenset("hybrid")}
                  />
                  Hybrid Mode
                </label>

                <label>
                  <input
                    type="radio"
                    name="backup"
                    value="standby"
                    checked={hasGenset === "standby"}
                    onChange={() => setHasGenset("standby")}
                  />
                  Standby Mode
                </label>

                <label>
                  <input
                    type="radio"
                    name="backup"
                    value="na"
                    checked={hasGenset === "na"}
                    onChange={() => setHasGenset("na")}
                  />
                  Not Applicable
                </label>
              </div>
            </div>
          </>
        )}

          {/* Main content (Confirm + Error Message) */}
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            {/* Show error message */}
            {errorMessage && (
              <p style={{ color: "red", marginTop: "10px" }}>{errorMessage}</p>
            )}

            <button
              style={styles.modeButton}
              onClick={() => {
                if (mode === "Hybrid") {
                  if (!phase) {
                    setErrorMessage("⚠️ Please select a genset phase.");
                    return;
                  }
                  if (!operatingM) {
                    setErrorMessage("⚠️ Please enter operating M.");
                    return;
                  }
                  if (!rangeMin) {
                    setErrorMessage("⚠️ Please enter the minimum M.");
                    return;
                  }
                  if (!rangeMax) {
                    setErrorMessage("⚠️ Please enter the maximum M.");
                    return;
                  }
                  if (!average) {
                    setErrorMessage("⚠️ Please enter the average M.");
                    return;
                  }
                  if (!kva) {
                    setErrorMessage("⚠️ Please enter the genset rating (kVA).");
                    return;
                  }
                  // ✅ Guardrails
                   if (Number(operatingM) <= 0) {
                    setErrorMessage("⚠️ Operating M cannot be negative.");
                    return;
                  }
                  if (Number(kva) <= 0) {
                    setErrorMessage("⚠️ Genset rating (kVA) must be greater than 0.");
                    return;
                  }
                  if (Number(rangeMin) < 0 || Number(rangeMax) < 0 || Number(average) < 0) {
                    setErrorMessage("⚠️ Load values cannot be negative.");
                    return;
                  }
                  if (Number(rangeMin) > Number(rangeMax)) {
                    setErrorMessage("⚠️ Minimum M cannot be greater than Maximum M.");
                    return;
                  }
                  if (Number(average) < Number(rangeMin) || Number(average) > Number(rangeMax)) {
                    setErrorMessage("⚠️ Average M must be between Min and Max.");
                    return;
                  }
                } else {
                  if (!value) {
                    setErrorMessage("⚠️ Please enter your electricity usage (kWh).");
                    return;
                  }
                  if (hasGenset === null) {
                    setErrorMessage("⚠️ Please select whether you have a backup genset.");
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
          You selected: <b>{mode}</b>
        </p>

        {mode === "Hybrid" ? (
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
              const pf = 0.9;
              const peakSunHour = 3.42;
              const panelWatt = 640; // W per panel
              const battery_kWh = 5; // Assume each battery ~5 kWh usable

              // Step 1: Convert kVA to kW capacity (for display/reference)
              const gensetCapacity = Number(kva) * pf;

              // Step 2: Use min, avg, max loads directly from Step 2 (already in kW)
              const minLoad = Number(rangeMin);
              const avgLoad = Number(average);
              const maxLoad = Number(rangeMax);

              // Step 3: Daily genset energy (kWh/day)
              const genset_kWh = avgLoad * Number(operatingHours);

              // Step 4: Required solar contribution (based on diesel saving %)
              const required_kWh = genset_kWh * (dieselSaving / 100);

              // Step 5: Solar panel & battery sizing
              const perPanel_kWh = (panelWatt / 1000) * peakSunHour;
              const totalPanels = Math.ceil(required_kWh / perPanel_kWh);
              const totalBatteries = Math.ceil(required_kWh / battery_kWh);

              return (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    gap: "20px",
                    marginTop: "20px",
                  }}
                >
                  {/* Card 1: System Constants */}
                  <div style={styles.card}>
                    <h4>🔧 System Constants</h4>
                    <ul style={{ textAlign: "left" }}>
                      <li>Power Factor (PF) = <b>0.9</b></li>
                      <li>kVA → kW Conversion = <b>kW = kVA × PF</b></li>
                      <li>Peak Sun Hours = <b>{peakSunHour}</b> h/day</li>
                      <li>Solar Panel Size = <b>{panelWatt} W</b></li>
                      <li>Battery Capacity = <b>{battery_kWh} kWh</b></li>
                    </ul>
                  </div>

                  {/* Card 2: Input Parameters */}
                  <div style={styles.card}>
                    <h4>📊 Input Parameters</h4>
                    <ul style={{ textAlign: "left" }}>
                      <li>Genset Rating = <b>{kva} kVA</b> (≈ {gensetCapacity.toFixed(1)} kW)</li>
                      <li>Operating Hours = <b>{operatingHours} h/day</b></li>
                      <li>Diesel Saving Target = <b>{dieselSaving}%</b></li>
                    </ul>
                  </div>

                  {/* Card 3: Load (from Step 2) */}
                  <div style={styles.card}>
                    <h4>⚡ Load Information</h4>
                    <ul style={{ textAlign: "left" }}>
                      <li>Min Load = <b>{minLoad} kW</b></li>
                      <li>Avg Load = <b>{avgLoad} kW</b></li>
                      <li>Max Load = <b>{maxLoad} kW</b></li>
                    </ul>
                  </div>

                  {/* Card 4: Energy Calculations */}
                  <div style={styles.card}>
                    <h4>🧮 Energy Calculations</h4>
                    <ul style={{ textAlign: "left" }}>
                      <li>Daily Genset Energy = {avgLoad} × {operatingHours} = <b>{genset_kWh.toFixed(1)} kWh/day</b></li>
                      <li>Required Solar Energy = {genset_kWh.toFixed(1)} × {dieselSaving/100} = <b>{required_kWh.toFixed(1)} kWh/day</b></li>
                      <li>Solar Output per Panel = ({panelWatt/1000} × {peakSunHour}) = <b>{perPanel_kWh.toFixed(2)} kWh/day</b></li>
                    </ul>
                  </div>

                  {/* Card 5: System Requirement */}
                  <div style={styles.card}>
                    <h4>✅ System Requirement</h4>

                    {phase === "three" ? (
                      <ul style={{ textAlign: "left" }}>
                        <li>
                          Total Solar Panels ≈{" "}
                          <b>
                            {required_kWh.toFixed(1)} ÷ {perPanel_kWh.toFixed(2)} ≈ {totalPanels}
                          </b>{" "}
                          (~{Math.ceil(totalPanels / 3)} per phase)
                        </li>
                        <li>
                          Total Batteries ≈{" "}
                          <b>
                            {required_kWh.toFixed(1)} ÷ {battery_kWh} ≈ {totalBatteries}
                          </b>{" "}
                          (~{Math.ceil(totalBatteries / 3)} per phase)
                        </li>
                      </ul>
                    ) : (
                      <ul style={{ textAlign: "left" }}>
                        <li>
                          Total Solar Panels ≈{" "}
                          <b>
                            {required_kWh.toFixed(1)} ÷ {perPanel_kWh.toFixed(2)} ≈ {totalPanels}
                          </b>
                        </li>
                        <li>
                          Total Batteries ≈{" "}
                          <b>
                            {required_kWh.toFixed(1)} ÷ {battery_kWh} ≈ {totalBatteries}
                          </b>
                        </li>
                      </ul>
                    )}
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
                <p>Backup Genset: <b>{hasGenset}</b></p>
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
                  <b>({value} × 1.3) ÷ ((615 ÷ 1000) × 3.42)</b> <br />
                  ≈ <b>{Math.ceil((Number(value) * 1.3) / ((615 / 1000) * 3.42))}</b> panels
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
                  <b>{Math.ceil((Number(value) * 1.3) / ((615 / 1000) * 3.42))}</b>
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

              // constants
              const peakSunHour = 3.42;
              const panelWatt = 640;
              const battery_kWh = 5;

              let totalPanels = 0;
              let totalBatteries = 0;
              let required_kWh = 0;
              let genset_kWh = 0;

              if (mode === "Hybrid") {
                genset_kWh = Number(average) * Number(operatingHours); // average load × hours
                required_kWh = genset_kWh * (dieselSaving / 100);

                totalPanels = Math.ceil(required_kWh / ((panelWatt / 1000) * peakSunHour));
                totalBatteries = Math.ceil(required_kWh / battery_kWh);
              } else {
                const autonomy = hasGenset === "yes" ? 1 : 3;
                required_kWh = Number(value);
                totalPanels = Math.ceil(Number(value) / ((panelWatt / 1000) * peakSunHour));
                totalBatteries = Math.ceil((required_kWh * autonomy) / battery_kWh);
              }

              // Title
              doc.setFontSize(20);
              doc.setTextColor(40, 90, 140);
              doc.text("System Sizing Report", 14, 20);

              // Section: Input Parameters
              doc.setFillColor(230, 240, 255);
              doc.rect(10, 30, 190, 10, "F");
              doc.setTextColor(0);
              doc.setFontSize(14);
              doc.text("Input Parameters", 14, 37);

              doc.setFontSize(12);
              if (mode === "Hybrid") {
                const kvaToKw = (Number(kva) * 0.9).toFixed(1);
                doc.text(`Mode: Hybrid`, 14, 47);
                doc.text(`Genset Rating: ${kva} kVA (≈ ${kvaToKw} kW at PF 0.9)`, 14, 55);
                doc.text(`Min Load: ${rangeMin} kW`, 14, 63);
                doc.text(`Avg Load: ${average} kW`, 14, 71);
                doc.text(`Max Load: ${rangeMax} kW`, 14, 79);
                doc.text(`Operating Hours: ${operatingHours} h/day`, 14, 87);
                doc.text(`Diesel Saving Target: ${dieselSaving}%`, 14, 95);
              } else {
                doc.text(`Mode: Off-Grid`, 14, 47);
                doc.text(`Daily Usage: ${value} kWh/day`, 14, 55);
                doc.text(`Backup Genset: ${hasGenset === "yes" ? "Yes" : "No"}`, 14, 63);
              }

              // Section: System Constants
              doc.setFillColor(230, 240, 255);
              doc.rect(10, 105, 190, 10, "F");
              doc.setFontSize(14);
              doc.text("System Constants", 14, 112);

              doc.setFontSize(12);
              doc.text(`Power Factor: 0.9`, 14, 122);
              doc.text(`Peak Sun Hours: ${peakSunHour} h/day`, 14, 130);
              doc.text(`Solar Panel Size: ${panelWatt} W`, 14, 138);
              doc.text(`Battery Capacity: ${battery_kWh} kWh`, 14, 146);

              // Section: Full Calculations
              doc.setFillColor(230, 240, 255);
              doc.rect(10, 156, 190, 10, "F");
              doc.setFontSize(14);
              doc.text("Full Calculations", 14, 163);

              doc.setFontSize(11);
              if (mode === "Hybrid") {
                doc.text(`1) Daily Genset Energy = Avg Load × Hours = ${average} × ${operatingHours} = ${genset_kWh.toFixed(1)} kWh/day`, 14, 173);
                doc.text(`2) Required Solar = ${genset_kWh.toFixed(1)} × (${dieselSaving}% ÷ 100) = ${required_kWh.toFixed(1)} kWh/day`, 14, 181);
                doc.text(`3) Per Panel Output = (${panelWatt} ÷ 1000) × ${peakSunHour} = ${(panelWatt/1000*peakSunHour).toFixed(2)} kWh/day`, 14, 189);
                doc.text(`4) Total Panels = ${required_kWh.toFixed(1)} ÷ ${(panelWatt/1000*peakSunHour).toFixed(2)} = ${totalPanels}`, 14, 197);
                doc.text(`5) Total Batteries = ${required_kWh.toFixed(1)} ÷ ${battery_kWh} = ${totalBatteries}`, 14, 205);
              } else {
                doc.text(`1) Required Energy = ${required_kWh} kWh/day`, 14, 173);
                doc.text(`2) Per Panel Output = (${panelWatt} ÷ 1000) × ${peakSunHour} = ${(panelWatt/1000*peakSunHour).toFixed(2)} kWh/day`, 14, 181);
                doc.text(`3) Total Panels = ${required_kWh} ÷ ${(panelWatt/1000*peakSunHour).toFixed(2)} = ${totalPanels}`, 14, 189);
                doc.text(`4) Total Batteries = ${required_kWh} ÷ ${battery_kWh} = ${totalBatteries}`, 14, 197);
              }

              // Section: Final System Requirement
              doc.setFillColor(230, 240, 255);
              doc.rect(10, 215, 190, 10, "F");
              doc.setFontSize(14);
              doc.text("System Requirement", 14, 222);

              doc.setFontSize(12);
              doc.setTextColor(20, 100, 20);
              doc.text(`Solar Panels Needed: ${totalPanels}`, 14, 232);
              doc.text(`Batteries Needed: ${totalBatteries}`, 14, 240);

              // Footer
              doc.setTextColor(120);
              doc.setFontSize(10);
              doc.text("Generated by Solar Sizing Tool", 14, 280);

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
              setRangeMin("");
              setRangeMax("");
              setAverage("");
              setKva("");
              setPhase("");
              setConfirmed(false);
              setShowHelper(false);
              setAppliance("");
              setPower("");
              setHours("");
              setOperatingHours("");
              setDieselSaving(50);
              setHasGenset(null);
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
  container: { width: 340, margin: "50px auto", textAlign: "center" },
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
    textAlign: "center"
  }
};

export default App;