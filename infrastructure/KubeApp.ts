import {ApiObjectMetadata, App, Chart, Size} from "cdk8s";
import {Construct} from "constructs";
import {Cpu, Deployment, Ingress, IngressBackend, Service, ServiceType} from "cdk8s-plus-24";

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
                ports: [{
                    number: 5000
                }],
                resources: {
                    cpu: {
                        request: Cpu.millis(100),
                        limit: Cpu.millis(200)
                    },
                    memory: {
                        request: Size.mebibytes(75),
                        limit: Size.mebibytes(150)
                    }
                },
                securityContext: {
                    ensureNonRoot: false
                }
            }]
        });
        const service = new Service(this, "service", {
            type: ServiceType.NODE_PORT,
            metadata,
            selector: deployment,
            ports: [{
                port: 80,
                targetPort: 5000
            }]
        });
        // new Service(this, "service-ingress", {
        //     type: ServiceType.EXTERNAL_NAME,
        //     metadata: {
        //         name: `${config.name}-${config.namespace}`,
        //         namespace: "nginx-system"
        //     },
        //     externalName: `${config.name}.${config.namespace}.svc.cluster.local`,
        //     ports: [{
        //         port: 80
        //     }]
        // });
        new Ingress(this, "ingress-master", {
            metadata: {
                name: "ingress-master",
                namespace: "nginx-system"
            },
            annotations: {
                "kubernetes.io/ingress.class": "nginx",
                "nginx.org/mergeable-ingress-type": "master"
            },
            // @ts-ignore
            rules: [{
                host: "104-200-27-45.ip.linodeusercontent.com"
            }]
        });
        new Ingress(this, "ingress", {
            metadata: {
                metadata: {
                    ...metadata
                },
                annotations: {
                    "kubernetes.io/ingress.class": "nginx",
                    "nginx.org/mergeable-ingress-type": "minion"
                }
            },
            rules: [{
                host: "104-200-27-45.ip.linodeusercontent.com",
                backend: IngressBackend.fromService(service),
                path: `/`
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
