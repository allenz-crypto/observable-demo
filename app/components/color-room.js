import Component from "@glimmer/component";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
import Observable from "zen-observable";
import { merge } from "zen-observable/extras";

export default class ColorRoomComponent extends Component {
  @tracked center = null;
  @tracked right = null;
  @tracked left = null;

  @tracked trackRightPixel = false;
  @tracked trackLeftPixel = false;

  @action
  renderGradient(element) {
    this.canvas = element;
    fillGradient(this.canvas);

    this.myPixelObserver = new Observable(observer => {
      function handleMouseMove(event) {
        const canvas = event.target;
        const context = canvas.getContext("2d");
        const { x, y } = mousePosition(canvas, event);

        observer.next({
          context,
          x,
          y,
          pixelPosition: "center"
        });
      }

      this.canvas.addEventListener("mousemove", handleMouseMove);

      return {
        unsubscribe: () => {
          this.canvas.removeEventListener("mousemove", handleMouseMove);
        }
      };
    });

    this.myLeftPixelObserver = this.myPixelObserver
      .map(value => {
        return {
          ...value,
          x: value.x - 10,
          pixelPosition: "left"
        };
      })
      .filter(() => {
        return this.trackLeftPixel;
      });

    this.myRightPixelObserver = this.myPixelObserver
      .map(value => {
        return {
          ...value,
          x: value.x + 10,
          pixelPosition: "right"
        };
      })
      .filter(() => {
        return this.trackRightPixel;
      });

    merge(
      this.myPixelObserver,
      this.myLeftPixelObserver,
      this.myRightPixelObserver
    ).subscribe(result => {
      this[result.pixelPosition] = hexColor(result);
    });
  }

  @action
  toggleLeftPixelTracker() {
    this.trackLeftPixel = !this.trackLeftPixel;
    if (!this.trackLeftPixel) {
      this.left = null;
    }
  }

  @action
  toggleRightPixelTracker() {
    this.trackRightPixel = !this.trackRightPixel;
    if (!this.trackRightPixel) {
      this.right = null;
    }
  }
}

function fillGradient(canvas) {
  if (canvas.getContext) {
    const context = canvas.getContext("2d");
    const gradient = context.createLinearGradient(10, 0, 500, 0);
    gradient.addColorStop(0, "red");
    gradient.addColorStop(1 / 6, "orange");
    gradient.addColorStop(2 / 6, "yellow");
    gradient.addColorStop(3 / 6, "green");
    gradient.addColorStop(4 / 6, "blue");
    gradient.addColorStop(5 / 6, "indigo");
    gradient.addColorStop(1, "violet");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 500, 500);
  }
}

function mousePosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function rgbToHex(r, g, b) {
  if (r > 255 || g > 255 || b > 255) throw "Invalid color component";
  return ((r << 16) | (g << 8) | b).toString(16);
}

function hexColor({ context, x, y }) {
  const p = context.getImageData(x - 1, y, 1, 1).data;
  return "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
}
