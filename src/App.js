import React, { useState } from "react";

function App() {
  const [mode, setMode] = useState("");        // "Hybrid" or "Off-Grid"
  const [value, setValue] = useState("");      // Genset kWm or Electricity kWh
  const [confirmed, setConfirmed] = useState(false);

  // Appliance helper states
  const [showHelper, setShowHelper] = useState(false);
  const [appliance, setAppliance] = useState("");
  const [power, setPower] = useState("");
  const [hours, setHours] = useState("");

  // Step 1: Select mode
  if (!mode) {
    return (
      <div style={styles.container}>
        <h2>Select System Type</h2>

        <div style={styles.card}>
          <h3>Hybrid</h3>
          <p>
            A hybrid system combines solar with grid or generator backup,
            ensuring power reliability while reducing dependence on the grid.
          </p>
          <button style={styles.modeButton} onClick={() => setMode("Hybrid")}>
            Choose Hybrid
          </button>
        </div>

        <div style={styles.card}>
          <h3>Off-Grid</h3>
          <p>
            An off-grid system is fully independent from the utility grid,
            using solar panels and batteries to supply all electricity needs.
          </p>
          <button style={styles.modeButton} onClick={() => setMode("Off-Grid")}>
            Choose Off-Grid
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Ask user-specific input
  if (!confirmed) {
    return (
      <div style={styles.container}>
        <h2>{mode} System Setup</h2>
        <p>
          {mode === "Hybrid"
            ? "Please enter your genset size (in kWm):"
            : "Please enter your electricity usage (in kWh):"}
        </p>

        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={styles.input}
          placeholder={
            mode === "Hybrid"
              ? "Enter genset size (kWm)"
              : "Enter electricity (kWh)"
          }
        />

        {mode === "Off-Grid" && (
          <>
            <p style={{ fontSize: 12, color: "#555" }}>
              💡 Tip: You can check your monthly electricity bill. <br />
              Or calculate: Appliance Power (W) × Hours ÷ 1000 = kWh.
            </p>
            <button
              style={styles.helpButton}
              onClick={() => setShowHelper(!showHelper)}
            >
              {showHelper ? "Close Helper" : "Help me calculate"}
            </button>

            {showHelper && (
              <div style={styles.card}>
                <h4>Appliance Calculator</h4>
                <input
                  type="text"
                  placeholder="Appliance (e.g. Fan)"
                  style={styles.input}
                  value={appliance}
                  onChange={(e) => setAppliance(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Power (W)"
                  style={styles.input}
                  value={power}
                  onChange={(e) => setPower(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Hours per day"
                  style={styles.input}
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
                <button
                  style={styles.modeButton}
                  onClick={() => {
                    if (power && hours) {
                      const kwh = (power * hours) / 1000;
                      setValue((prev) =>
                        (Number(prev) || 0) + Number(kwh)
                      );
                      setAppliance("");
                      setPower("");
                      setHours("");
                    }
                  }}
                >
                  Add Appliance
                </button>
                <p>Total so far: {value || 0} kWh</p>
              </div>
            )}
          </>
        )}

        <div>
          <button
            style={styles.modeButton}
            onClick={() => setConfirmed(true)}
            disabled={!value}
          >
            Confirm
          </button>
          <button
            style={styles.backButton}
            onClick={() => {
              setMode("");
              setValue("");
              setShowHelper(false);
            }}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Show result summary
  return (
    <div style={styles.container}>
      <h2>System Summary</h2>
      <p>
        You selected: <b>{mode}</b>
      </p>
      <p>
        {mode === "Hybrid"
          ? `Genset size: ${value} kWm`
          : `Electricity usage: ${value} kWh`}
      </p>
      <button
        style={styles.backButton}
        onClick={() => {
          setMode("");
          setValue("");
          setConfirmed(false);
          setShowHelper(false);
        }}
      >
        ← Start Over
      </button>
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
};

export default App;