import * as React from "react";
import { useGlobalState } from "../../components/GlobalProvider";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import MobileStepper from "@mui/material/MobileStepper";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import { apiService } from "../../actions/services";
import { NavLink } from "react-router-dom";
import "./style.scss";
import { bgcolor } from "@mui/system";

export default function TemplateList(props: any) {
  const {
    setGenerator,
    generator
  }: any = useGlobalState();

  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(0);
  const [templates, setTemplates] = React.useState<any>();

  React.useEffect(() => {
    apiService.fetchTemplates().then((res) => {
      if (res.data) {
        setTemplates(res.data);
        setGenerator(2);
      }
    });
  }, []);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <React.Fragment>
      {templates && (
        <Box sx={{ maxWidth: 400, flexGrow: 1 }} className="template-list-wrap">
          <Paper
            square
            elevation={0}
            sx={{
              display: "flex",
              alignItems: "center",
              textAlign: "center",
              height: 50,
              pl: 2,
              bgcolor: "transparent",
            }}
          >
            <Typography color={"#efefef"} textAlign={"center"} width={"95%"}>Please Choose a Template to Start</Typography>
          </Paper>
          <Box sx={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
         
            <img src={`${templates[activeStep]?.directory}${templates[activeStep]?.thumbnail}`} alt="template" width="100%" />
            <Typography>{templates[activeStep].name}</Typography>
            <NavLink to={`/template/${templates[activeStep].id}`}><Button variant="outlined" style={{ marginTop: "16px" }}>Start Editing</Button></NavLink>
          </Box>
          <MobileStepper
            variant="text"
            steps={templates.length}
            position="static"
            activeStep={activeStep}
            style={{ background: "transparent", color: "#efefef" }}
            nextButton={
              <Button
                size="small"
                onClick={handleNext}
                style={activeStep === templates.length - 1 ? { color: "#efefef", opacity: "0.4"} : { color: "#efefef" }}
                disabled={activeStep === templates.length - 1}
              >
                Next
                {theme.direction === "rtl" ? (
                  <KeyboardArrowLeft />
                ) : (
                  <KeyboardArrowRight />
                )}
              </Button>
            }
            backButton={
              <Button
                size="small"
                onClick={handleBack}
                style={activeStep === 0 ? { color: "#efefef", opacity: "0.4"} : { color: "#efefef" }}
                disabled={activeStep === 0}
              >
                {theme.direction === "rtl" ? (
                  <KeyboardArrowRight />
                ) : (
                  <KeyboardArrowLeft />
                )}
                Back
              </Button>
            }
          />
        </Box>
      )}
    </React.Fragment>
  );
}
