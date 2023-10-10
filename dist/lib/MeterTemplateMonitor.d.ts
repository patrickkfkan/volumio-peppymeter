import FSMonitor from './utils/FSMonitor';
export default class MeterTemplateMonitor extends FSMonitor<['addDir', 'unlinkDir']> {
    #private;
    name: string;
    constructor();
    getTemplates(): {
        name: string;
        meters: string[];
    }[];
    stop(): Promise<void>;
    protected handleEvent(event: 'addDir' | 'unlinkDir', _path: string): void;
    get status(): "initializing" | "running" | "updating" | "stopped";
}
//# sourceMappingURL=MeterTemplateMonitor.d.ts.map