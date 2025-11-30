import subprocess
import os

def process_video(input_path: str, output_dir: str, quality: int = 26, blur_sigma: float = 5.0, blur_steps: int = 1) -> str:
    """
    비디오의 화질을 낮추고 블러 효과를 적용합니다.

    Args:
        input_path (str): 원본 비디오 파일의 경로.
        output_dir (str): 처리된 비디오를 저장할 디렉토리 경로.
        quality (int): 비디오 화질 (CRF 값). 18(고품질)에서 28(낮은 품질) 사이의 값.
                       값이 높을수록 화질은 낮아지고 파일 크기는 작아집니다. 기본값 26.
        blur_sigma (float): 가우시안 블러의 강도. 값이 높을수록 블러가 강해집니다. 기본값 5.0.
        blur_steps (int): 가우시안 블러의 반복 횟수. 기본값 1.

    Returns:
        str: 처리된 비디오 파일의 상대 경로.
    
    Raises:
        Exception: ffmpeg 명령 실행 실패 시.
    """
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"원본 비디오 파일을 찾을 수 없습니다: {input_path}")
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    base_name = os.path.basename(input_path)
    name_without_ext, ext = os.path.splitext(base_name)
    output_name = f"{name_without_ext}_processed{ext}"
    output_full_path = os.path.join(output_dir, output_name)

    # ffmpeg command: blur and reduce quality
    # -y to overwrite output file without asking
    command = [
        "ffmpeg",
        "-i", input_path,
        "-vf", f"gblur=sigma={blur_sigma}:steps={blur_steps}",
        "-crf", str(quality),
        "-y",
        output_full_path
    ]

    try:
        # Execute the ffmpeg command
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        print(f"ffmpeg stdout: {result.stdout}")
        print(f"ffmpeg stderr: {result.stderr}")
        
        # Return a relative path or full path as needed.
        # Assuming output_dir is within a known base path that can be converted to URL.
        return output_full_path

    except subprocess.CalledProcessError as e:
        print(f"ffmpeg command failed: {e}")
        print(f"ffmpeg stdout: {e.stdout}")
        print(f"ffmpeg stderr: {e.stderr}")
        raise Exception(f"비디오 처리 실패: {e.stderr}")
    except FileNotFoundError:
        raise Exception("ffmpeg를 찾을 수 없습니다. ffmpeg가 설치되어 있고 PATH에 추가되었는지 확인하세요.")
    except Exception as e:
        raise Exception(f"비디오 처리 중 알 수 없는 오류 발생: {e}")

# Example usage (for testing, not part of the deployed code)
if __name__ == '__main__':
    # Create a dummy video file for testing
    # In a real scenario, input_path would be an actual video file
    dummy_input_path = "dummy_input.mp4"
    with open(dummy_input_path, "w") as f:
        f.write("This is a dummy video file content.")
    
    output_directory = "processed_videos"
    
    try:
        print(f"Processing video: {dummy_input_path}")
        processed_video_path = process_video(
            input_path=dummy_input_path,
            output_dir=output_directory,
            quality=28,       # Lower quality
            blur_sigma=10.0   # More blur
        )
        print(f"Processed video saved to: {processed_video_path}")
    except Exception as e:
        print(f"Error during video processing: {e}")
    finally:
        # Clean up dummy file and directory
        if os.path.exists(dummy_input_path):
            os.remove(dummy_input_path)
        if os.path.exists(output_directory):
            # For a proper cleanup, you'd need to remove the processed video inside too
            # os.remove(os.path.join(output_directory, "dummy_input_processed.mp4"))
            pass # Keep processed output for inspection for now.
