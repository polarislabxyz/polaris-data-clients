fn main() {
    let proto = "../proto/polaris/data_gateway/v1/data_gateway.proto";
    println!("cargo:rerun-if-changed={proto}");
    tonic_build::configure()
        .build_server(false)
        .compile_protos(&[proto], &["../proto"])
        .expect("compile polaris data gateway proto");
}
