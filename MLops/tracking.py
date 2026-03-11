import mlflow

#mlflow setup
mlflow.set_tracking_uri("./mlruns")
mlflow.set_experiment("smart_outfits")

def log_recommendation(detected: list, suggestions: list, from_rag: bool, response_time: float):
    with mlflow.start_run(run_name="recommendation"):
        mlflow.log_param("detected_items",  ", ".join(detected))
        mlflow.log_param("num_detected",    len(detected))
        mlflow.log_param("from_rag_cache",  str(from_rag))
        mlflow.log_metric("response_time_ms", response_time)
        mlflow.log_metric("num_suggestions",  len(suggestions))

def log_detection(detected: list, response_time: float):
    with mlflow.start_run(run_name="detection"):
        mlflow.log_param("detected_labels", ", ".join(detected))
        mlflow.log_metric("num_detected",     len(detected))
        mlflow.log_metric("response_time_ms", response_time)