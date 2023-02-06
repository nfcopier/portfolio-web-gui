import {ApiObjectMetadata, App, Chart, Size} from "cdk8s";
import {Construct} from "constructs";
import {Cpu, Deployment, Ingress, IngressBackend, Service} from "cdk8s-plus-24";

const GITHUB_OWNER: string = "nfcopier";
const GITHUB_REPOSITORY: string = "portfolio-web-gui";
const NAMESPACE: string = "index"
const TAG: string = process.argv[2];

interface NathanServiceConfig {
    namespace: string;
    name: string;
}

class NathanService extends Chart {

    public constructor(scope: Construct, config: NathanServiceConfig) {
        super(scope, `${GITHUB_REPOSITORY}-${NAMESPACE}`);
        const metadata: ApiObjectMetadata = config;
        const deployment = new Deployment(this, "deployment", {
            metadata,
            replicas: 1,
            containers: [{
                image: `ghcr.io/${GITHUB_OWNER}/${GITHUB_REPOSITORY}:${TAG}`,
                resources: {
                    cpu: {
                        request: Cpu.millis(100),
                        limit: Cpu.millis(200)
                    },
                    memory: {
                        request: Size.mebibytes(75),
                        limit: Size.mebibytes(150)
                    }
                }
            }]
        });
        const service = new Service(this, "service", {
            metadata,
            selector: deployment,
            ports: [{
                port: 80,
                targetPort: 5000
            }]
        });
        new Ingress(this, "ingress", {
            metadata,
            rules: [{
                backend: IngressBackend.fromService(service),
                path: `/${config.namespace}/${config.name}`
            }]
        });
    }
}

const app = new App();
new NathanService(app, {
    name: "web-gui",
    namespace: "index"
});
app.synth();
